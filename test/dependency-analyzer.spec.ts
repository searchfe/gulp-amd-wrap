/*
 * @Author: qiansc
 * @Date: 2019-04-28 18:55:00
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-04-29 17:47:29
 */

import { parse, parseScript } from 'esprima';
import { dirname } from 'path';
import { DependencyAnalyzer } from '../src/dependency-analyzer';

const code = `
var A = require('A');
var B = require('./B');
var C = require('/C');
var D = require('@D/E');
`;

/**
 * [{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":
 * {"type":"Identifier","name":"A"},"init":{"type":"CallExpression","callee":{"type":
 * "Identifier","name":"require"},"arguments":[{"type":"Literal","value":"A","raw":"'A'"}]}}],"kind":"var"}]
 */

const ast = parseScript(code);
// console.log(JSON.stringify(ast));
const da = new DependencyAnalyzer(dirname(__dirname), ast);

console.log(da.analysis());

// require('A');

/**
 * [{"type":"ExpressionStatement","expression":{"type":"CallExpression","callee":{"type":"Identifier",
 * "name":"require"},"arguments":[{"type":"Literal","value":"A","raw":"'A'"}]}}]
 */
describe('Test is comming soon', () => {
  it('one', () => {
  // do nothing
  });
});
