'use strict';


angular.module('oevfApp')
  .controller('MainCtrl', ['$scope', '$http', 'Streets', 'Localities', 'Clients', 'Api', function ($scope, $http, Streets, Localities, Clients, Api) {
    
    delete $http.defaults.headers.common['X-Requested-With'];
    
    var pageQueryString = window.location.search;
    if (pageQueryString) {
      if (pageQueryString.indexOf('?') === 0) {
        pageQueryString = pageQueryString.slice(1);
      }
      var pairs = pageQueryString.split('&');
      var params = {};
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var splitIdx = pair.indexOf('=');
        var key;
        var value = null;
        if (splitIdx >= 0) {
          key = decodeURIComponent(pair.slice(0, splitIdx));
          value = decodeURIComponent(pair.slice(splitIdx + 1));
        } else {
          key = decodeURIComponent(pair);
        }
        params[key] = value;
      }
      $scope.pageQueryParams = params;
      var clientId = $scope.pageQueryParams.eid;
      $scope.clientId = clientId;
      $scope.clientInfo = Clients.fromId(clientId) || {};
    }
    $scope.embedded = $scope.clientInfo && true || false;
    
    $scope.apiEndpoint = Clients.apiEndpoint($scope.clientId);
    
    $scope.verify = {
      StreetType: '',
      custom: {}
    };
    
    $scope.captcha = {};
    $scope.captcha.id = Api.randomCode(32);
    
    $scope.submitting = false;
    
    $scope.result = {};
    $scope.result.status = 'info';
    $scope.result.html = '';
    
    $scope.matchedLocalities = {};
    
    $scope.streetTypes = Streets.types;
    $scope.streetParts = Streets.parts;
    
    $scope.$on('$viewContentLoaded', function(){
      broadcastSize();
    });
    
    $scope.prefixFilter = function(prefix) {
      prefix = (prefix || '').toUpperCase();
      return function(term) {
        term = term || '';
        if (angular.isArray) {
          term = term[1]; // this is a road type/part entry
        }
        return (term.indexOf(prefix) === 0);
      };
    };
    
    $scope.findLocalities = function(prefix) {
      var promise = Localities.search(prefix, $scope.clientId);
      if (promise) {
        return Localities.search(prefix, $scope.clientId).then(function(response) {
          return response.data;
        });
      } else {
        return [];
      }
    };
    
    $scope.verifyEnrolment = function() {
      $scope.submitting = true;
      var locality = $scope.verify.locality;
      if (!locality) {
        $scope.result.html =
          '<h4>INVALID LOCATION</h4><p></p>' +
          '<p>We don\'t know that location..</p>' +
          '<p>Please check your entry and try again.</p>';
        $scope.result.status = 'error';
        $scope.submitting = false;
        return;
      }
      $scope.result.status = 'warning';
      $scope.result.html = '<h4>Checking ...<h4>';
      var verify = $scope.verify;
      verify.CaptchaId = $scope.captcha.id;
      verify.StreetType = verify.StreetType && verify.StreetType.toUpperCase();
      if (!Streets.isAecStreetPart(verify.StreetType)) {
        verify.StreetType = '';
      }
      verify.Suburb = locality.loc + ' (' + locality.st + ')';
      verify.Postcode = locality.pc;
      verify.clientId = $scope.clientId;
      var content = JSON.stringify(verify);
      $http(
        {
          method: 'POST',
          url: $scope.apiEndpoint + '/verify',
          data: content,
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      ).
        success(function(result) {
          $scope.submitting = false;
          if (result.verified) {
            $scope.result.status = 'success';
            $scope.result.html =
              '<h4>YOUR ENROLMENT WAS VERIFIED</h4><p></p>' + 
              '<p>You\'re in the federal electorate of <b>' + result.federalElectorate + '</b>.</p>' +
              '<p>Your address on the electoral roll is:<br /><b>' + result.address + '</b>.</p>';
          } else {
            // TODO: distinguish failed CAPTCHA situations
            $scope.result.html =
              '<h4>NOT VERIFIED</h4><p></p>' +
              '<p>Sorry, we couldn\'t verify those details.</p>' +
              '<p>Please check that they\'re correct.</p>';
            $scope.result.status = 'error';
          }
        }).
        error(function() {
          $scope.submitting = false;
          $scope.result.status = 'error';
          $scope.result.html = '<h4>Our apologies. We\'ve enountered an unexpected problem. Please try again later.</h4>';
        });
    };
    
    $scope.tryAgain = function() {
      $scope.captcha.id = Api.randomCode(32);
      $scope.verify.CaptchaCode = '';
      $scope.result.status = 'info';
      $scope.result.html = '';
    };
    
    $scope.refreshCaptcha = function() {
      $scope.captcha.id = Api.randomCode(32);
      $scope.verify.CaptchaCode = '';
    };
  }]);