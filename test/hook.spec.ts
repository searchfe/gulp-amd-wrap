/*
 * @Author: qiansc
 * @Date: 2019-04-24 15:54:24
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-04-29 17:28:42
 */

import * as gulp from 'gulp';
import * as path from 'path';
import { amdHook } from '../src/hook';

gulp.src(
    `${__dirname}\/assert/*.js`, {
    base: __dirname,
  },
//  path.resolve(__dirname, 'assert/minify-define.js')
).pipe(amdHook({
  exlude: ['/assert/exclude-**.js', '/dist/**'],
})).pipe(
  gulp.dest(`${__dirname}\/dist\/`),
);

// describe('测试评论列表项组件', () => {

//   it('测试1', () => {
//     const propsData = {
//       name: 'hj',
//     };

//     expect(propsData.name).toBe('hj');

//   });

// });
