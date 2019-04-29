/*
 * @Author: qiansc
 * @Date: 2019-04-28 18:55:00
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-04-29 17:47:33
 */
import { generate } from 'escodegen';
import { parse, parseScript } from 'esprima';
import { dirname } from 'path';
import { AsyncAnalyzer } from '../src/async-analyzer';

const code = `

require(['A', './B', '/C', '@D/E'], function(a, b, c, d){});

`;
/**
 * [{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":
 * {"type":"Identifier","name":"A"},"init":{"type":"CallExpression","callee":{"type":
 * "Identifier","name":"require"},"arguments":[{"type":"Literal","value":"A","raw":"'A'"}]}}],"kind":"var"}]
 */

const ast = parseScript(code);

const aa = new AsyncAnalyzer(dirname(__dirname), ast);
aa.analysis();
console.log(generate(aa.ast));

describe('Test is comming soon', () => {
  it('one', () => {
  // do nothing
  });
});
