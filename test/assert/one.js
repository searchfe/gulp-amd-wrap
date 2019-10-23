define(function() {
  'use strict';

  var moduleA = require('./debug/index');

  require(['./debug/index'], function(debug){
    return debug;
  });

  return {

  };

});
