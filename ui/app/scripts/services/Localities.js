'use strict';

angular.module('oevfApp')
  .factory('Localities', ['$http', 'Clients', '$q', function ($http, Clients, $q) {
    return {
      search: function (prefix, clientId) {
        if (prefix.length < 3) {
          var res = $q.defer();
          res.resolve([]);
          return null;
        }
        var apiEndpoint = Clients.apiEndpoint(clientId);
        return $http.get(
          apiEndpoint + '/localities/' + encodeURIComponent(prefix)
        );
      }
    };
  }]);
