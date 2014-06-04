'use strict';

var _ = require('underscore');
var fs = require('fs');
var cluster = require('cluster');
var http = require('http');
var https = require('https');
var querystring = require('querystring');
var htmlparser = require('htmlparser');
var select = require('soupselect').select;
var localityDatabase = require('radix-tree').create();
var nano = require('nano');

var config = require('./config');
var clients = require('./clients');
var numCPUs = require('os').cpus().length;

var SERVER_PORT = config.server.port;
var LOCALITY_FILE = './localities.txt';
var CLUSTER_SIZE = 3;

var AEC_HOST = config.aec.host;
var AEC_CAPTCHA_PATH_BASE = config.aec.captchaPathBase;
var AEV_VERIFY_PATH = '/VerifyEnrolment.aspx';


function reloadAecVars() {
  var aecVarsFile = 'aec_vars.json';
  var key = __dirname + '/' + aecVarsFile;
  var oldViewState = (config.aec.vars !== undefined) && config.aec.vars['__VIEWSTATE'];
  delete require.cache[key];
  config.aec.vars = require(key);
  var newViewState = config.aec.vars['__VIEWSTATE'];
  if (oldViewState && oldViewState !== newViewState) {
    console.log('VIEWSTATE updated to: ' + newViewState);
  }
}

function jsonReplyHeaders(length) {
  return {
    'Content-Type': 'application/json',
    'Content-Length' : length
  }
}

function setCorsHeaders(req, headers) {
  var corsHeaders = config.server.cors;
  var origin = req.headers.origin
  if (headers === undefined) {
    headers = corsHeaders;
  } else {
    _.defaults(headers, corsHeaders);
  }
  // TODO: check this is listed in the client info
  headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}


function handleCorsRequest(req, res) {
  var headers = setCorsHeaders(req);
  res.writeHead(200, headers);
  res.end();
  console.log('CORS DONE: ' + JSON.stringify(headers, true, 2));
}
  
function handleLocalitiesQuery(req, res, path) {
  var term = decodeURIComponent(path.split('/')[2]).toUpperCase();
  var results = [];
  if (term.length > 2) {
    results = localityDatabase.search(term, 20);
  }
  var resultStr = JSON.stringify(results);
  var headers = jsonReplyHeaders(resultStr.length);
  headers = setCorsHeaders(req, headers);
  res.writeHead(200, headers);
  res.write(resultStr);
  res.end();
}

function proxyCaptchaRequest(req, res, path) {
  
  var cid = path.split('/')[2];
  var url = AEC_CAPTCHA_PATH_BASE + cid + "&d=" + Date.now();
  
  var proxyReq = https.get({
    host: AEC_HOST,
    path: url,
    port: 443
  }, function (proxyRes) {
    
    var status = proxyRes.statusCode;
    var headers = proxyRes.headers;
    var mime = headers['content-type'];
    var length = headers['content-length'];
    var cookies = headers['set-cookie'];
    
    var sessionId = cookies[0].split(';')[0].split('=')[1];
    if (status === 200) { // get ready to proxy
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Length', length);
      res.setHeader('Set-Cookie', 'ASP.NET_SessionId=' + sessionId + '; path=/');
    }
    
    proxyRes.on('data', function (chunk) {
      res.write(chunk);
    });
    proxyRes.on('end', function () {
      if (status === 200) {
        console.log('REPLY: got captcha');
      } else {
        res.writeHead(400, 'failed');
      }
      res.end();
    });
  });
  proxyReq.end();
}

function handleClientInfoRequest(req, res, path) {
  var clientId = decodeURIComponent(path.split('/')[2]);
  console.log('looking up client info for eid: ' + clientId);
  var results = clients[clientId];
  if (results) {
    results = results.public;
    results.id = clientId;
  } else {
    results = {};
  }
  var resultStr = JSON.stringify(results);
  var headers = jsonReplyHeaders(resultStr.length);
  headers = setCorsHeaders(req, headers);
  res.writeHead(200, headers);
  res.write(resultStr);
  console.log('REPLY: ' + resultStr);
  res.end();
}

function proxyVerifyRequest(req, res) {
   var jsonStr = '';
  req.on('data', function(ch) {
    jsonStr = jsonStr + ch;
  });
  req.on('end', function() {
    var input = JSON.parse(jsonStr);
    var verify = {
      'ctl00$ContentPlaceHolderBody$textSurname': (input.Surname || '').toUpperCase(),
      'ctl00$ContentPlaceHolderBody$textGivenName': (input.GivenName || '').toUpperCase(),
      'ctl00$ContentPlaceHolderBody$textStreetName': (input.StreetName || '').toUpperCase() + ' ' + (input.StreetType || '').toUpperCase(),
      'ctl00$ContentPlaceHolderBody$textPostcode': (input.Postcode || '').toUpperCase(),
      'ctl00$ContentPlaceHolderBody$DropdownSuburb': (input.Suburb || '').toUpperCase(),
      'LBD_VCID_verifyenrolment_ctl00_contentplaceholderbody_captchaverificationcode': input.CaptchaId || '',
      'ctl00$ContentPlaceHolderBody$textVerificationCode': (input.CaptchaCode || '').toUpperCase()
    };
    var outgoingHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': req.headers.cookie,
      'Referrer': 'https://oevf.aec.gov.au/VerifyEnrolment.aspx',
      'DNT': '1'
    };
    var proxyReq = https.request({
      host: AEC_HOST,
      port: 443,
      path: AEV_VERIFY_PATH,
      method: 'POST',
      headers: outgoingHeaders
    }, function (proxyRes) {
      
      var status = proxyRes.statusCode;
      var headers = proxyRes.headers;
      var mime = headers['content-type'];
      var length = headers['content-length'];
      
      var proxyResData = '';
      proxyRes.on('data', function (chunk) {
        proxyResData = proxyResData + chunk;
      });
      proxyRes.on('end', function () {
        if (status === 200) {
          var handler = new htmlparser.DefaultHandler(function(err, dom) {
            if (err) {
              console.log('parsing error: ' + err);
              res.writeHead(400, 'failed to parse AEC reply');
              res.end();
            } else {
              var addressElems = select(dom, '#ctl00_ContentPlaceHolderBody_labelAddress');
              var verified = addressElems.length > 0;
              var result = {
                verified: verified  
              };
              if(verified) {
                result.address = addressElems[0].children[0].raw;
                result.federalElectorate = select(dom, '#ctl00_ContentPlaceHolderBody_linkProfile')[0].children[0].raw;
              }
              var reply = JSON.stringify(result);
              var headers = jsonReplyHeaders(reply.length);
              headers = setCorsHeaders(req, headers);
              res.writeHead(200, headers);
              if (verified) {
                var cleanInput = {
                  surname: (input.Surname || '').toUpperCase(),
                  givenNames: (input.GivenName || '').toUpperCase(),
                  unitNumber: (input.FlatNumber || '').toUpperCase(),
                  streetNumber: (input.StreetNumber || '').toUpperCase(),
                  streetName: (input.StreetName || '').toUpperCase(),
                  streetType: (input.StreetType || '').toUpperCase(),
                  postcode: (input.locality.pc || '').toUpperCase(),
                  locality: (input.locality.loc || '').toUpperCase(),
                  state: (input.locality.st || '').toUpperCase(),
                  clientData: input.custom || {},
                  clientId: input.clientId || {},
                  verified: verified,
                  posted: Date.now()
                };
                saveFormData(cleanInput.clientId, cleanInput,
                  function() {
                    console.log('SENDING REPLY (VERIFIED): ' + reply);
                    res.write(reply);
                    res.end();
                  },
                  function(err) {
                    console.log('ERROR: database: ' + err);
                    res.writeHead(500, 'database failure');
                    res.end();
                  }
                );
              } else {
                console.log('SENDING REPLY: ' + reply);
                res.write(reply);
                res.end();
              }
            }
          });
          var parser = new htmlparser.Parser(handler);
          parser.parseComplete(proxyResData);
        } else {
          res.writeHead(400, 'failed');
          res.end();
        }
      });
    });
    
    reloadAecVars();
    _.defaults(verify, config.aec.vars);
    
    var body = querystring.stringify(verify);
    proxyReq.write(body);
    proxyReq.end();
  });
}

function handleUnknownRequest(req, res) {
  res.writeHead(400, { 'Content-Type': 'text/plain' });
  console.log('unhandled request');
  res.write('unhandled request');
  res.end();
}

function handleSystemError(req, res, err) {
  console.log('ERROR: ABANDONING REQUEST DUE TO UNEXPECTED ERROR: ' + err);
  console.log(err.stack);
  try {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.write('unexpected system error');
    res.end();
  } catch (err2) {
    // not much left we can do at this point
  }
}

function saveFormData(clientId, data, onSuccess, onError) {
  var dbUrl = clients[clientId].couchdb.url;
  console.log('  DB is here: ' + dbUrl);
  var db = nano(dbUrl);
  db.insert(data, function (error) {
    if (error) {
      onError(error);
    } else {
      onSuccess();
    }
  }); 
}

function createLocalityDatabase(andThen) {
  fs.readFile(LOCALITY_FILE, 'utf8', function (err,data) {
    if (err) {
      console.log(err);
    } else {
      var lines = data.split('\n');
      console.log('read ' + lines.length + ' lines from locality file');
      lines.forEach(function(line) {
        line = line.trim();
        if (line) {
          var parts = line.split('\t');
          var locality = parts[0].trim();
          var state = parts[1].trim();
          var postcode = parts[2].trim();
          var uniqueLocality = locality + '|' + state + '|' + postcode;
          var entry = {
            loc: locality,
            st: state,
            pc: postcode
          };
          try {
            localityDatabase.insert(uniqueLocality, entry);
          } catch (err) {
            console.log('ERROR AT: ' + uniqueLocality);
          }
        }
      });
      console.log('locality database (in-memory radix tree) created');
    }
    andThen();
  });
}

function runServer() {
  http.createServer(function (req, res) {
    try {
      var method = req.method;
      var path = req.url.split('?')[0]; // ignore any request params
      console.log('REQUEST: ' + method + ' ' +  path);
      if (method === 'OPTIONS') {
        handleCorsRequest(req, res);
      } else if (method === 'GET' && path.indexOf('/localities/') === 0) {
        handleLocalitiesQuery(req, res, path);
      } else if (method === 'GET' && path.indexOf('/captcha/') === 0) {
        proxyCaptchaRequest(req, res, path);
      } else if (method === 'GET' && path.indexOf('/client/') === 0) {
        handleClientInfoRequest(req, res, path);
      } else if (method === 'POST' && path === '/verify') {
        proxyVerifyRequest(req, res);
      } else {
        handleUnknownRequest(req, res);
      }
    } catch (err) {
      handleSystemError(req, res, err);
    }
  }).listen(SERVER_PORT);
  console.log('\nSERVER LISTENING ON PORT: ' + SERVER_PORT + ' ...\n');
}


// ### DO STUFF


reloadAecVars();

if (cluster.isMaster) {
  for (var i = 0; i < CLUSTER_SIZE; i++) {
    console.log('cluster: starting worker ' + (i + 1));
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
    cluster.fork();
  });
} else {
  createLocalityDatabase(runServer);
}
