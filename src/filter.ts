/*
 * @Author: qiansc
 * @Date: 2019-04-25 17:28:25
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-04-29 17:29:05
 */
import { IOptions, sync } from 'glob';

/**
 * 判断文件filePath是否在规则覆盖范围内
 */
export function include(filePath: string, patterns?: string[], option?: IOptions): boolean {
  const list = filterList(patterns, option);
  return list.indexOf(filePath) > -1;
}

/**
 * 根据glob配置筛选符合的list
 */
export function filterList(patterns?: string[], option?: IOptions): string[] {
  let list: string[] = [];
  if (patterns) {
    for (const pattern of patterns) {
      list = list.concat(sync(pattern, { root: option && option.root}));
    }
  }
  return list;
}
