/*
 * @Author: qiansc
 * @Date: 2019-04-27 14:21:32
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-09-19 17:47:04
 */
import { traverse, VisitorOption } from 'estraverse';
import * as moduleID from './moduleID';

/** 针对Node节点分析所有require依赖 */
export class AsyncAnalyzer {
  constructor(
    /** 当前路径 */
    private cwd: string,
    /** 分析的ast node,因为ast库没有支持ts,所以ast类型为any */
    public ast: any,
    /** baseUrl of ModuleID */
    private baseUrl?: string,
  ) {}

  /** 进行分析找出require并利用回调处理 最后返回依赖表 */
  public analysis() {
    traverse(this.ast, {
      enter: (node, parent) => {
        if (matchAsyncRequireCallExpression(node)) {
          node.arguments[0].elements.forEach((element, index) => {
            /** 如果是动态require就不会有value require(mod) */
            if (element.value) {
              element.value = moduleID.parseBase(
                this.baseUrl || this.cwd, moduleID.parseAbsolute(this.cwd, element.value));
              delete element.raw;
            }
          });
        }
      },
    });
  }
}

/** 判断当前node节点为require VariableDeclarator */
function matchAsyncRequireCallExpression(node) {
  return !!(
    node.type === 'CallExpression' &&
    node.callee !== undefined && node.callee.name === 'require' &&
    node.arguments && node.arguments[0] && node.arguments[0].type === 'ArrayExpression' &&
    node.arguments[0].elements
  );
}
  /**
   * [{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":
   * {"type":"Identifier","name":"A"},"init":{"type":"CallExpression","callee":{"type":
   * "Identifier","name":"require"},"arguments":[{"type":"Literal","value":"A","raw":"'A'"}]}}],"kind":"var"}]
   */
