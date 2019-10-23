define(function () {
    'use strict';

    const moduleA = require('./debug/index');

    require(['./debug/index'], function (debug) {
        return debug;
    });

    return {

    };
});
