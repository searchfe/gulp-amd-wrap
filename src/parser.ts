/*
 * @Author: qiansc
 * @Date: 2019-04-28 14:43:21
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-04-29 17:29:32
 */
import { generate } from 'escodegen';
import { parse, parseScript } from 'esprima';
import { traverse } from 'estraverse';
import { dirname } from 'path';
import { AsyncAnalyzer } from './async-analyzer';
import { DependencyAnalyzer } from './dependency-analyzer';
import { parseBase } from './moduleID';

export class Parser {
  private cwd: string;
  private ast;
  constructor(private contents: Buffer, private filePath: string, private root: string, private prefix: string) {
    this.cwd = dirname(filePath);
    this.parse();
  }
  public getContent() {
    return this.contents;
  }
  public isHasObj(arr, val) {
    let flag = false;
    arr.forEach((element) => {
      if (JSON.stringify(element).indexOf(JSON.stringify(val)) !== -1) {
        flag = true;
      }
    });
    return flag;
  }
  public hook() {
    // console.log(this.contents.toString());
    traverse(this.ast, {
      enter: (node) => {
        if (node.type === 'CallExpression') {
          if (node.callee && node.callee.name === 'define') {

            if (node.arguments[0].type === 'FunctionExpression') {
              node.arguments.unshift(
                { type: 'ArrayExpression', elements: []},
              );
            }

            if (node.arguments[0].type === 'ArrayExpression') {
              node.arguments.unshift(
                { type: 'Literal', value: parseBase(this.root, this.filePath, this.prefix)},
              );
            }
            const analyzer = new DependencyAnalyzer(
              this.cwd,
              node,
              this.root,
            );

            const deps = analyzer.analysis(
              (dep, requireNode, parent) => {
                // requireNode.id.name = {type};
                // console.log('analyzer', dep, requireNode);
              },
            );
            if (!this.isHasObj(node.arguments[1].elements, 'require')) {
              node.arguments[1].elements.push({ type: 'Literal', value: 'require' });
            }
            if (!this.isHasObj(node.arguments[2].params, 'require')) {
              node.arguments[2].params.push({ type: 'Identifier', name: 'require' });
            }
            deps.forEach((dep) => {
              node.arguments[1].elements.push({type: 'Literal', value: dep.moduleID });
              node.arguments[2].params.push({type: 'Identifier', name: dep.name });
            });
          }
        }
        return node;
      },
      leave: (node) => {
        const aa = new AsyncAnalyzer(
          this.cwd,
          node,
          this.root,
        );
        aa.analysis();
      },
    });
    this.contents = generate(this.ast);
  }
  private parse() {
    this.ast = parseScript(this.contents.toString());
  }

  /**
   * define(function() {});
   */
  private isSingelFunction() {
    // do nothing
  }

  /**
   * define([...], function() {});
   */

  /**
   * define('XXX', [...], function() {});
   */

}
