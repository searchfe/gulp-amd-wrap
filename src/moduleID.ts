/*
 * @Author: qiansc
 * @Date: 2019-04-29 12:53:02
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-04-29 17:17:08
 */
import { resolve } from 'path';

/** 将相对路径转化为绝对路径 ./A ../ */
export function parseAbsolute(
  /** 当前路径 */
  cwd: string,
  /** 分析的ast node,因为ast库没有支持ts,所以ast类型为any */
  moduleID: string,
): string {
  if (moduleID.match(/^(\.\/|\.\.\/)/)) {
    return resolve(cwd, moduleID);
  }
  return moduleID;
}

/** 将绝对路径转化为基于BaseURL的 ModuleId */
export function parseBase(
  /** 当前路径 */
  baseUrl: string,
  /** 分析的ast node,因为ast库没有支持ts,所以ast类型为any */
  moduleID: string,
  /** moduleID前缀 */
  prefix?: string,
): string {
  if (moduleID.match(/^\//) !== null && moduleID.indexOf(baseUrl) === 0 ) {
    return (prefix ? prefix + '/' : '') + moduleID.substring(baseUrl.length + 1).replace(/(\.js|\.ts)$/, '');
  }
  return (prefix ? prefix + '/' : '') + moduleID.replace(/(\.js|\.ts)$/, '');
}
