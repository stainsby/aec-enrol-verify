'use strict';

// TODO: rename module to Utils?

angular.module('oevfApp')
  .factory('Api', function () {
    
    var CODE_CHARS = '0123456789abcdef';
    
    return {
      randomCode: function(n) {
        var code = '';
        for( var i=0; i < n; i++ ) {
          code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
        }
        return code;
      }
    };
  });
