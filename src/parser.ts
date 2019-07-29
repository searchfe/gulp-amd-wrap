/*
 * @Author: qiansc
 * @Date: 2019-04-28 14:43:21
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-06-05 10:45:51
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
  public hook(hookOption: HookOption = {}) {
    // console.log(this.contents.toString());
    traverse(this.ast, {
      enter: (node) => {
        if (node.type === 'CallExpression') {
          // 如果是define
          if (node.callee && node.callee.name === 'define') {
            // 首参数是function，推入依赖数组
            if (node.arguments[0].type === 'FunctionExpression') {
              const ele = node.arguments[0].params.map((item) => ({type: 'Literal', value: item.name }));
              node.arguments.unshift(
                { type: 'ArrayExpression', elements: ele},
              );
            }
            // 首参数是依赖数组，推入moduleId
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
            if (node.arguments[1] && !this.isHasObj(node.arguments[1].elements, 'require')) {
              node.arguments[1].elements.push({ type: 'Literal', value: 'require' });
            }
            if (node.arguments[2] && !this.isHasObj(node.arguments[2].params, 'require')) {
              node.arguments[2].params.push({ type: 'Identifier', name: 'require' });
            }
            deps.forEach((dep) => {
              if (node.arguments[1].elements.map( (e) => e.value).indexOf(dep.moduleID) < 0) {
                node.arguments[1].elements.push({type: 'Literal', value: dep.moduleID });
                if (dep.name) {
                  node.arguments[2].params.push({ type: 'Identifier', name: dep.name });
                }
              }
            });
            if (hookOption.removeModuleId) {
              node.arguments.shift();
            }
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

interface HookOption {
  removeModuleId?: boolean;
}
