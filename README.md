# gulp-amd-hook
![Language](https://img.shields.io/badge/-TypeScript-blue.svg)
[![Build Status](https://travis-ci.org/searchfe/gulp-amd-hook.svg?branch=master)](https://travis-ci.org/searchfe/gulp-amd-hook)
[![Coveralls](https://img.shields.io/coveralls/searchfe/gulp-amd-hook.svg)](https://coveralls.io/github/searchfe/gulp-amd-hook)
[![npm package](https://img.shields.io/npm/v/gulp-amd-hook.svg)](https://www.npmjs.org/package/gulp-amd-hook)
[![npm downloads](http://img.shields.io/npm/dm/gulp-amd-hook.svg)](https://www.npmjs.org/package/gulp-amd-hook)

gulp-amd-hook是一个分析amd模块，并进行预编译处理的的gulp插件，主要完成根据依赖分析及项目路径生成模块声明及引用的moduleID，并封装成amd规范的模块。

## Install

```bash
npm i gulp-amd-hook --save-dev
```

## Example

```
import { amdHook } from'gulp-amd-hook';

gulp.src(
  // 资源
  `${__dirname}\/assert/*.js`, {
      // 工程baseUrl
      base: __dirname,
    },
).pipe(amdHook({
  // 不参与amd-hook分析的文件
  exlude: ['/assert/exclude-**.js', '/dist/**'],
})).pipe(
  gulp.dest(`${__dirname}\/dist\/`),
);

```

```
// Before
define(function() {
  'use strict';

  var fishObj = {
    name: 'nimo'
  };
  var moduleA = require('@scope/moduleA');
  var moduleB = require('./moduleB');

  require(['A', './B', '/C', '@D/E'], function(a, b, c, d){
    console.log(a, b, c, d);
  });

  return fishObj;

});

// After
define('assert/minify-define', [
    'require',
    '@scope/moduleA',
    'assert/moduleB'
], function (require, moduleA, moduleB) {
    'use strict';
    var fishObj = { name: 'nimo' };
    require([
        'A',
        'assert/B',
        '/C',
        '@D/E'
    ], function (a, b, c, d) {
        console.log(a, b, c, d);
    });
    return fishObj;
});

```

## API

[API DOC](https://searchfe.github.io/gulp-amd-hook/)
