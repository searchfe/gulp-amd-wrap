# gulp-amd-wrap
![Language](https://img.shields.io/badge/-TypeScript-blue.svg)
[![Build Status](https://travis-ci.org/searchfe/gulp-amd-wrap.svg?branch=master)](https://travis-ci.org/searchfe/gulp-amd-wrap)
[![Coveralls](https://img.shields.io/coveralls/searchfe/gulp-amd-wrap.svg)](https://coveralls.io/github/searchfe/gulp-amd-wrap)
[![npm package](https://img.shields.io/npm/v/gulp-amd-wrap.svg)](https://www.npmjs.org/package/gulp-amd-wrap)
[![npm downloads](http://img.shields.io/npm/dm/gulp-amd-wrap.svg)](https://www.npmjs.org/package/gulp-amd-wrap)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

gulp-amd-wrap是一个分析amd模块，并进行预编译处理的的gulp插件，主要完成根据依赖分析及项目路径生成模块声明及引用的moduleID，并封装成amd规范的模块。

## Install

```bash
npm i gulp-amd-wrap --save-dev
```

## Example

```Typescript
import { amdWrap } from 'gulp-amd-wrap';

gulp.src(
  // 资源
  `${__dirname}\/assert/*.js`, {
      // 工程baseUrl
      base: __dirname,
    },
).pipe(amdWrap({
  baseUrl: '/assert/',
  prefix: 'wiseindex/',
  // 不参与amd-hook分析的文件
  exelude: ['/exclude-**.js', '/dist/**'],
  moduleID: {
    'moduleID': 'filepath'
  }
})).pipe(
  gulp.dest(`${__dirname}\/dist\/`),
);

```

```javascript
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

[API DOC](https://searchfe.github.io/gulp-amd-wrap/)
