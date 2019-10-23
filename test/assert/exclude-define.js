/**
 * minify define amd module
 */

define([], function () {
    'use strict';

    const fishObj = {
        name: 'nimo'
    };
    const moduleA = require('@scope/moduleA');
    const moduleB = require('./moduleB');

    require(['A', './B', '/C', '@D/E'], function (a, b, c, d) {
        console.log(a, b, c, d);
        return 5;
    });

    return fishObj;
});
