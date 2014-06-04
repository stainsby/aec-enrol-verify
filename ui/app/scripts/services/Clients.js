'use strict';

angular.module('oevfApp')
  .factory('Clients', ['$http', function ($http) {
    
    var DEFAULT_API_ENDPOINT = 'http://oevf.example.com/api';
    
    var CLIENTS = {
      testing: {
        apiEndpoint: DEFAULT_API_ENDPOINT
      }
    };
    
    function lookupApiEndpoint(clientId) {
      if (clientId === undefined || CLIENTS[clientId] === undefined) {
        return DEFAULT_API_ENDPOINT;
      }
      return CLIENTS[clientId].apiEndpoint;
    }
    
    return {
      
      apiEndpoint: lookupApiEndpoint,
      
      fromId: function (clientId) {
        var endpoint = lookupApiEndpoint(clientId);
        return $http.get(
            endpoint + '/client/' + encodeURIComponent(clientId)
        );
      }
    };
  }]);
