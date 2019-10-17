import { readFileSync } from 'fs';
import * as gulp from 'gulp';
import * as path from 'path';
import { Parser } from '../src/parser';

const root = __dirname;
const filePath = path.resolve(root, './assert/minify-define.js');
const content = readFileSync(filePath);
const prefix = 'molecule';

describe('Parser Spec Test', () => {
  it('minify-define', () => {
    const parser = new Parser(content, filePath, root, prefix);
    parser.hook();
    const code = parser.getContent().toString();

    return new Promise((resolve) => {
      function require() {
        if (arguments[0] === '@scope/moduleA' || arguments[0] === 'molecule/assert/moduleB') {
          return;
        }
        expect(arguments[0]).toMatchObject([
          'A',
          prefix+ '/assert/B',
          '/C',
          '@D/E',
        ]);
        expect(arguments[1].apply(this, arguments[0])).toBe(5);
        resolve();
      }
      function define(moduleID, deps, func) {
        expect(moduleID).toBe('molecule/assert/minify-define');
        expect(deps).toMatchObject([
          'require', '@scope/moduleA', 'molecule/assert/moduleB',
        ]);
        func(require, {}, {});
      }
      // tslint:disable-next-line:no-eval
      eval(code);
    });
  // do nothing
  });

  it('un-moduleId-define', () => {
    const parser = new Parser(content, filePath, root, '');
    parser.hook({
      removeModuleId: true,
    });
    const code = parser.getContent().toString();
    console.log(code);
    return new Promise((resolve) => {
      function require() {
        if (arguments[0] === '@scope/moduleA' || arguments[0] === 'assert/moduleB') {
          return;
        }
        expect(arguments[0]).toMatchObject([
          'A',
          'assert/B',
          '/C',
          '@D/E',
        ]);
        expect(arguments[1].apply(this, arguments[0])).toBe(5);
        resolve();
      }
      function define(deps, func) {
        expect(deps).toMatchObject([
          'require', '@scope/moduleA', 'assert/moduleB',
        ]);
        func(require, {}, {});
      }
      // tslint:disable-next-line:no-eval
      eval(code);
    });
  });

  // it('minify-define', () => {
  //   const parser = new Parser(content, filePath, root, prefix);
  //   parser.hook();
  //   const code = parser.getContent().toString();

  //   return new Promise((resolve) => {
  //     function require() {
  //       expect(arguments[0]).toMatchObject([
  //         'A',
  //         'assert/B',
  //         '/C',
  //         '@D/E',
  //       ]);
  //       expect(arguments[1].apply(this, arguments[0])).toBe(5);
  //       resolve();
  //     }
  //     function define(moduleID, deps, func) {
  //       expect(moduleID).toBe('molecule/assert/minify-define');
  //       expect(deps).toMatchObject([
  //         'require', '@scope/moduleA', 'assert/moduleB',
  //       ]);
  //       func(require, {}, {});
  //     }
  //     // tslint:disable-next-line:no-eval
  //     eval(code);
  //   });
  // // do nothing
  // });
});
