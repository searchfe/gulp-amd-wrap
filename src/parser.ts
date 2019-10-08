/*
 * @Author: qiansc
 * @Date: 2019-04-28 14:43:21
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-06-05 10:45:51
 */
import { generate } from 'escodegen';
import { parse, parseScript } from 'esprima';
import { traverse } from 'estraverse';
import { basename, dirname, extname } from 'path';
import { AsyncAnalyzer } from './async-analyzer';
import { DependencyAnalyzer } from './dependency-analyzer';
import { parseAbsolute, parseBase } from './moduleID';

export class Parser {
  private cwd: string;
  private ast;
  private myModuleId: string;
  private dependences: string[];
  constructor(
    private contents: Buffer,
    private filePath: string,
    private root: string,
    private prefix: string,
    private moduleId?: string,
    private staticBaseUrl?: string) {
    this.cwd = dirname(filePath);
    this.parse();
    this.dependences = [];
  }
  public getContent() {
    return this.contents;
  }
  public getModuleId() {
    return this.myModuleId;
  }
  public getDependences() {
    return Array.from(new Set(this.dependences));
  }
  public isHasObj(arr, val) {
    let flag = false;
    if (!arr || arr.length === 0) { return false; }
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
          if (isAmdDefine(node)) {
            // 首参数是function，推入依赖数组
            if (node.arguments[0].type === 'FunctionExpression') {
              const ele = node.arguments[0].params.map((item) => ({ type: 'Literal', value: item.name }));
              node.arguments.unshift(
                { type: 'ArrayExpression', elements: ele },
              );
            }
            // 首参数是依赖数组，推入moduleId
            if (node.arguments[0].type === 'ArrayExpression') {
              node.arguments.unshift(
                {
                  type: 'Literal',
                  value: parseBase(this.root, this.filePath, this.prefix, this.moduleId)
                },
              );
            } else if (node.arguments[0].type === 'ObjectExpression' || node.arguments[0].type === 'Identifier') {
              node.arguments.unshift({ type: 'ArrayExpression', elements: [] });
              node.arguments.unshift({
                type: 'Literal',
                value: parseBase(this.root, this.filePath, this.prefix, this.moduleId)});
            } else if (node.arguments[0].type === 'Literal') {
              const moduleId = node.arguments[0].value;
              if (moduleId.split('/').pop() === basename(this.filePath, extname(this.filePath))) {
                const prefix = moduleId.match(/^\./) === null ? '' : this.prefix;
                node.arguments[0].value = parseBase(this.root, this.filePath, prefix);
              }
            }
            this.myModuleId = node.arguments[0].value;
            const analyzer = new DependencyAnalyzer(
              this.cwd,
              node,
              this.prefix,
              this.root,
              this.staticBaseUrl);

            const deps = analyzer.analysis(
              (dep, requireNode, parent) => {
                // requireNode.id.name = {type};
                // console.log('analyzer', dep, requireNode);
              },
            );
            if (node.arguments[1]
              && !this.isHasObj(node.arguments[1].elements, 'require')
              && node.arguments[1].elements) {
              node.arguments[1].elements.push({ type: 'Literal', value: 'require' });
            }
            if (node.arguments[2] && !this.isHasObj(node.arguments[2].params, 'require') && node.arguments[2].params) {
              node.arguments[2].params.push({ type: 'Identifier', name: 'require' });
            }
            deps.forEach((dep) => {
              if (node.arguments[1] && node.arguments[1].elements &&
                node.arguments[1].elements.map((e) => e.value).indexOf(dep.moduleID) < 0) {
                  node.arguments[1].elements.push({ type: 'Literal', value: dep.moduleID });
                  // factory函数的参数中推入依赖对应的变量名
                  if (dep.name) {
                    node.arguments[2].params.push({ type: 'Identifier', name: dep.name });
                  }
                  this.dependences.push(dep.moduleID);
              }
            });
            if (hookOption.removeModuleId) {
              node.arguments.shift();
            }
          }
          if (node.callee && node.callee.name === 'require') {
            const firstArg = node.arguments[0];
            // 首参数是依赖数组，推入moduleId
            if (firstArg.type === 'ArrayExpression') {
              firstArg.elements.map((element) => {
                if (element.value && element.value.match(/^\.\.?\//) !== null) {
                  element.value = parseBase(
                    this.root,
                    parseAbsolute(this.cwd, element.value),
                    '',
                    this.moduleId);
                  element.raw = `"${element.value}"`;
                  this.dependences.push(element.value);
                }
              });
            }
            if (firstArg.type === 'Literal') {
              if (firstArg.value && firstArg.value.match(/^\.\.?\//) !== null) {
                const baseUrl = extname(firstArg.value) !== '.json' ? this.root : this.staticBaseUrl || this.root;
                firstArg.value = parseBase(
                  baseUrl,
                  parseAbsolute(this.cwd, firstArg.value),
                  '',
                  this.moduleId);
                firstArg.raw = `"${firstArg.value}"`;
                this.dependences.push(firstArg.value);
              }
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
function isAmdDefine(node) {
  if (node.callee && node.callee.name === 'define') {
    const index = node.arguments.map((item, idx) => {
      if (item.type === 'FunctionExpression') {
        return idx;
      }
      return null;
    }).join('');
    if (node.arguments[+index].params && node.arguments[+index].params.length > 0) {
      const params = node.arguments[+index].params.map((item) => {
        return item.name;
      });
      // 结果页特殊的define覆盖
      return params.slice(-3).join('') !== 'exportsmodule$';
    }
    return true;
  }
  return false;
}
