define([
    'require'
], function (require) {
    define('./xx', function () {
        const one = require('one');
        const two = require('./two');
    });
    define(function () {
        define(function () {
            'use strict';
        });
        const one = require('one');
        const two = require('./two');
    });
    return 'multi';
});
