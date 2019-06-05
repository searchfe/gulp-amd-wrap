/*
 * @Author: qiansc
 * @Date: 2019-04-24 15:54:24
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-06-05 17:27:23
 */

import { existsSync, readFileSync, unlinkSync } from 'fs';
import * as gulp from 'gulp';
import * as path from 'path';
import { absolutize } from '../src/absolutize';

describe('Absolutize Test', () => {
  it('Absolutize', () => {
    const file = `${__dirname}\/dist\/assert-absolutize\/modulex.js`;
    if (existsSync(file)) {
      unlinkSync(file);
    }

    return new Promise((resolve) => {
      let time = 0;
      function require() {
        expect(arguments[0]).toMatchObject([
          'A',
          'assert/B',
          '/C',
          '@D/E',
        ]);
        expect(arguments[1].apply(this, arguments[0])).toBe(5);
      }
      function define(moduleID, deps, func) {
        time ++;
        switch (time) {
          case 1:
              expect(moduleID).toBe('assert-absolutize/modulex');
              expect(deps).toMatchObject([
                'require', '@scope/moduleA', 'assert/moduleB',
              ]);
              break;
          case 2:
              expect(moduleID).toBe('@scope/modulex');
              expect(deps).toMatchObject(['assert-absolutize/modulex']);
              resolve();
              break;
        }
        func(require, {}, {});
      }

      gulp.src(
          `${__dirname}\/assert-absolutize/*.js`, {
          base: __dirname,
        },
      //  path.resolve(__dirname, 'assert/minify-define.js')
      ).pipe(absolutize({
        'assert-absolutize/modulex': '@scope/modulex',
      })).pipe(
        gulp.dest(`${__dirname}\/dist\/`),
      ).on('end',
        () => {
          const code = readFileSync(file).toString();
          // tslint:disable-next-line:no-eval
          eval(code);
        },
      );

    });
  });
});

// describe('测试评论列表项组件', () => {

//   it('测试1', () => {
//     const propsData = {
//       name: 'hj',
//     };

//     expect(propsData.name).toBe('hj');

//   });

// });
