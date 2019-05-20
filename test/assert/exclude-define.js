/**
 * minify define amd module
 */

define([], function() {
  'use strict';

  var fishObj = {
    name: 'nimo'
  };
  var moduleA = require('@scope/moduleA');
  var moduleB = require('./moduleB');

  require(['A', './B', '/C', '@D/E'], function(a, b, c, d){
    console.log(a, b, c, d);
    return 5;
  });

  return fishObj;

});
