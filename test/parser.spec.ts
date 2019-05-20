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
        expect(arguments[0]).toMatchObject([
          'A',
          'assert/B',
          '/C',
          '@D/E',
        ]);
        expect(arguments[1].apply(this, arguments[0])).toBe(5);
        resolve();
      }
      function define(moduleID, deps, func) {
        expect(moduleID).toBe('molecule/assert/minify-define');
        expect(deps).toMatchObject([
          'require', '@scope/moduleA', 'assert/moduleB',
        ]);
        func(require, {}, {});
      }
      // tslint:disable-next-line:no-eval
      eval(code);
    });
  // do nothing
  });
});
