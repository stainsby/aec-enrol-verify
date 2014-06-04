'use strict';

var querystring = require('querystring');

module.exports = {
  
  server: {
    cors: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods' : 'GET, POST',
      'Access-Control-Allow-Credentials' : 'true',
      'Access-Control-Allow-Headers' : 'Content-Type',
      'Access-Control-Max-Age' : '60'
    },
    port: 8000
  },
  
  aec: {
    captchaPathBase: '/BotDetectCaptcha.ashx?get=image&c=verifyenrolment_ctl00_contentplaceholderbody_captchaverificationcode&t=',
    host: 'oevf.aec.gov.au'
  }
  
};
