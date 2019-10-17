define([
  'require'
], function(require) {
    define('./xx', function() {
      var one = require('one');
      var two = require('./two');
    });
    define(function() {
      define(function() {
        'use strict';

      });
      var one = require('one');
      var two = require('./two');
    });
    return 'multi';
});
