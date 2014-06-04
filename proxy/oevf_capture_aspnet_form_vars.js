window.__dirname = phantom.libraryPath;
var casper = require('casper').create({
    verbose: true,
    logLevel: "info"
});
var fs = require('fs');
var dump = require('utils').dump;


casper.log('running in directory: ' + window.__dirname);

casper.start();

casper.open('https://oevf.aec.gov.au');
casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)');

casper.then(function() {
  this.log('loaded AEC OEVF home page', 'info', 'app');
});

// we need to trigger a postcode key-up event to get validated
casper.then(function () {
  this.sendKeys('input#ctl00_ContentPlaceHolderBody_textSurname', 'Myname');
  this.sendKeys('input#ctl00_ContentPlaceHolderBody_textGivenName', 'Fred');
  //this.sendKeys('input#ctl00_ContentPlaceHolderBody_textStreetNumber', '19');
  this.sendKeys('input#ctl00_ContentPlaceHolderBody_textStreetName', 'Ross');
  //this.sendKeys('select#ctl00_ContentPlaceHolderBody_comboStreetType', 'Ave');
  this.sendKeys('input#ctl00_ContentPlaceHolderBody_textPostcode', '4444');
  this.wait(3000, function() {
    this.sendKeys('select#ctl00_ContentPlaceHolderBody_DropdownSuburb', 'E');
    this.sendKeys('input#ctl00_ContentPlaceHolderBody_textVerificationCode', 'ERD5');
  });
});


casper.thenClick('input#ctl00_ContentPlaceHolderBody_buttonVerify', function(resp) {
  var values = this.getFormValues('form#aspnetForm');
  var aecVars = {
    __LASTFOCUS: '',
    __EVENTTARGET: '',
    __EVENTARGUMENT: '',
    __VIEWSTATE : values['__VIEWSTATE'],
    __EVENTVALIDATION : values['__EVENTVALIDATION'],
    'ctl00$ContentPlaceHolderBody$buttonVerify' : values['ctl00$ContentPlaceHolderBody$buttonVerify']
  };
  fs.write('aec_vars.json', JSON.stringify(aecVars, true, 2), 'w');
});

casper.run();

