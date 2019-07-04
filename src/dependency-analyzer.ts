/*
 * @Author: qiansc
 * @Date: 2019-04-28 17:25:33
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-04-29 16:14:06
 */
import { traverse, VisitorOption } from 'estraverse';
import * as moduleID from './moduleID';

/** 针对Node节点分析所有require依赖 */
export class DependencyAnalyzer {
  private dependencies: IDependency[] = [];
  constructor(
    /** 当前路径 */
    private cwd: string,
    /** 分析的ast node,因为ast库没有支持ts,所以ast类型为any */
    private ast: any,
    /** baseUrl of ModuleID */
    private baseUrl?: string,
  ) {}

  /** 进行分析找出require并利用回调处理 最后返回依赖表 */
  public analysis(cb?: analysisCallback): IDependency[] {
    traverse(this.ast, {
      enter: (node, parent) => {
        if (matchRequireVariableDeclarator(node)) {
          const dep = getDependencyFromNode(node);
          dep.moduleID = moduleID.parseBase(this.baseUrl || this.cwd, moduleID.parseAbsolute(this.cwd, dep.moduleID));
          const replaced = cb ? cb(dep, node, parent) : undefined;
          this.dependencies.push(dep);
        }
      },
      leave(this: any, node, parent) {
        if (node.type === 'VariableDeclaration') {
          const declarations = hasRequireDeclarations(node);
          if (declarations) {
            if (declarations.length) {
              node.declarations = declarations;
            } else {
              /** 这里有个非常坑的bug 没有办法拿到traverse return VisitorOption.Remove 也不会删除，只能置空 */
              node.type = 'EmptyStatement';
              // this.remove();
              return VisitorOption.Remove;
            }
          }
        }
      },
    });
    return this.dependencies;
  }
}

interface IDependency {
  name: string;
  value: string;
  moduleID: string;
}

type analysisCallback = (dep: IDependency, node: any, parent: any) => any;

/** 判断当前node节点为require VariableDeclarator 以及 require Literal */
function matchRequireVariableDeclarator(node) {
  return !!(
    (node.type === 'VariableDeclarator' &&  node.id && node.id.name !== undefined &&
    node.init && node.init.callee !== undefined && node.init.callee.name === 'require' &&
    node.init.arguments && node.init.arguments[0] && node.init.arguments[0].value !== undefined) ||
    (node.type === 'CallExpression' && node.arguments[0] && node.arguments[0].type === 'Literal' &&
    node.callee && node.callee.name === 'require')
  );
}
/** 判断当前node节点是否包含require VariableDeclarator 返回去除后正常的declarations */
function hasRequireDeclarations(node) {
  const notRequireDeclarations: any[] = [];
  let hasRequire = false;
  if (node.type === 'VariableDeclaration' && node.declarations) {
    node.declarations.forEach((element) => {
      if (matchRequireVariableDeclarator(element)) {
        hasRequire = true;
      } else {
        notRequireDeclarations.push(element);
      }
    });
  }
  if (hasRequire === false) {
    return false;
  } else {
    return notRequireDeclarations;
  }
}
  /**
   * [{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":
   * {"type":"Identifier","name":"A"},"init":{"type":"CallExpression","callee":{"type":
   * "Identifier","name":"require"},"arguments":[{"type":"Literal","value":"A","raw":"'A'"}]}}],"kind":"var"}]
   */

/** 从 require VariableDeclarator 节点获取依赖信息 */
function getDependencyFromNode(node): IDependency {
  return {
    moduleID: node.init ? node.init.arguments[0].value : node.arguments[0].value,
    name: node.id ? node.id.name : '',
    value: node.init ? node.init.arguments[0].value : node.arguments[0].value,
  };
}

/**
 * require('A');
 * [{"type":"ExpressionStatement","expression":{"type":"CallExpression","callee":{"type":"Identifier",
 * "name":"require"},"arguments":[{"type":"Literal","value":"A","raw":"'A'"}]}}]
 */
