/*
 * @Author: qiansc
 * @Date: 2019-04-24 15:54:24
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-10-18 19:29:30
 */

import { existsSync, readFileSync, unlinkSync } from 'fs';
import * as gulp from 'gulp';
import * as path from 'path';
import { amdWrap } from '../src/hook';

describe('Hook Test', () => {
    it('minify define', () => {
        const file = `${__dirname}\/dist\/assert\/minify-define.js`;
        if (existsSync(file)) {
            unlinkSync(file);
        }

        return new Promise((resolve) => {
            function require () {
                if (arguments[0] === '@scope/moduleA' || arguments[0] === 'assert/moduleB') {

                } else {
                    expect(arguments[0]).toMatchObject([
                        'A',
                        'assert/B',
                        '/C',
                        '@D/E'
                    ]);
                    expect(arguments[1].apply(this, arguments[0])).toBe(5);
                    resolve();
                }
            }
            function define (moduleID, deps, func) {
                expect(moduleID).toBe('assert/minify-define');
                expect(deps).toMatchObject([
                    'require', '@scope/moduleA', 'assert/moduleB'
                ]);
                func(require, {}, {});
            }

            gulp.src(
                `${__dirname}\/assert/*.js`, {
                    base: __dirname
                }
            ).pipe(amdWrap({
                exclude: ['/assert/exclude-**.js', '/dist/**']
            })).pipe(
                gulp.dest(`${__dirname}\/dist\/`)
            ).on('end',
                () => {
                    const code = readFileSync(file).toString();
                    eval(code);
                }
            );
        });
    });
});
