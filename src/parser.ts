/*
 * @Author: qiansc
 * @Date: 2019-04-28 14:43:21
 * @Last Modified by: liangjiaying@baidu.com
 * @Last Modified time: 2019-08-20 15:53:56
 */
import { generate } from 'escodegen';
import { parse, parseScript } from 'esprima';
import { traverse } from 'estraverse';
import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { AsyncAnalyzer } from './async-analyzer';
import { DependencyAnalyzer } from './dependency-analyzer';
import { include } from './filter';
import { parseAbsolute, parseBase } from './moduleID';

const md5File = require('md5-file');

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
    /** 生成的ModuleId md5后缀来避免其他模块引用 @molecule/toptip2_134dfas */
    let md5Value: string = '';

    if (hookOption.useMd5 === true || hookOption.useMd5 && hookOption.useMd5.useMd5) {
      const exlude = hookOption.useMd5.exlude; // 要被排除的文件

      if (!include(resolve(this.filePath), exlude, this.root)) {
        // 不在md5排除名单中
        try {
          md5Value = '_' + md5File.sync(this.filePath.replace('.js', '.ts')).slice(0, 7);
        } catch (e) {
          console.log(e);
        }
      }
    }
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
            // 首参数推入moduleId => define("@molecule/toptip/main",xxxx)
            if (node.arguments[0].type === 'ArrayExpression') {
              node.arguments.unshift(
                { type: 'Literal', value: parseBase(this.root, this.filePath, this.prefix) + md5Value},
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

            // 第二参数是依赖数组 => define("", ['require', 'exports', 'md5-file'])
            if (node.arguments[1].elements) {
              node.arguments[1].elements.forEach((element, index) => {
                const valueString = element.value;
                /** depPath: 实际依赖的相对路径文件。如果是node_module就为空 */
                const depPath = parseAbsolute(dirname(this.filePath), valueString + '.ts');
                if ( existsSync(depPath) ) {
                  const md5 = '_' + md5File.sync(depPath).slice(0, 7);
                  // moduleid 示例：@molecule/toptip/main_dc85e717d6352fa285bc70bc2d1d3595
                  const moduleid = parseBase(this.root, depPath, this.prefix) + md5;
                  node.arguments[1].elements[index].value = moduleid ;
                }
              });
            }

            if (node.arguments[1] && !this.isHasObj(node.arguments[1].elements, 'require')) {
              node.arguments[1].elements.push({ type: 'Literal', value: 'require' });
            }
            if (node.arguments[2] && !this.isHasObj(node.arguments[2].params, 'require')) {
              node.arguments[2].params.push({ type: 'Identifier', name: 'require' });
            }
            deps.forEach((dep) => {
              if (node.arguments[1].elements.map((e) => e.value).indexOf(dep.moduleID) < 0) {
                node.arguments[1].elements.push({type: 'Literal', value: dep.moduleID});
                if (dep.name) {
                  node.arguments[2].params.push({ type: 'Identifier', name: dep.name});
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
  useMd5?: any;
}
