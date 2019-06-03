/*
 * @Author: qiansc
 * @Date: 2019-04-25 17:28:25
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-06-03 20:42:21
 */
import { IOptions, sync } from 'glob';
import { resolve } from 'path';

/**
 * 判断文件filePath是否在规则覆盖范围内
 */
export function include(filePath: string, patterns?: string[], option?: IOptions): boolean {
  const list = filterList(patterns, option);
  if (option && option.cwd) {
    filePath = resolve(option.cwd, filePath);
  }
  console.log('patterns', patterns);
  console.log('option', option);
  console.log('list', list);
  console.log('filePath', filePath);
  return list.indexOf(filePath) > -1;
}

/**
 * 根据glob配置筛选符合的list
 */
export function filterList(patterns?: string[], option?: IOptions): string[] {
  let list: string[] = [];
  if (patterns) {
    for (const pattern of patterns) {
      list = list.concat(sync(pattern, option));
    }
  }
  if (option && option.cwd) {
    list.forEach((item, index) => {
      list[index] = resolve(option.cwd as string, item);
    });
  }
  return list;
}
