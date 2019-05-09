/*
 * @Author: qiansc
 * @Date: 2019-04-23 11:17:36
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-04-29 17:04:48
 */
import { File } from 'gulp-util';
import stream = require('readable-stream');

import { include } from './filter';
import { Parser } from './parser';

const Transform = stream.Transform;

export function amdHook(option: IAmdHook) {
  return new Transform({
    objectMode: true,
    transform: (file: File, enc, callback) => {
      // 传入baseUrl则moduleid基于baseUrl计算
      const baseUrl = option.baseUrl || file.base;
      const prefix = option.prefix || '';
      if (include(file.path, option.exlude, {
        root: file.base,
      })) {
        // 在exlude名单中 do nothing
        // console.log('ignore', file.path);
        callback(null, file);
      } else {
        const parser = new Parser(file.contents, file.path, baseUrl, prefix);
        parser.hook();
        file.contents = new Buffer(parser.getContent());
        callback(null, file);
      }
    },
  });
}

interface IAmdHook {
  /** 即项目根目录。用来配置模块查找根目录 */
  baseUrl?: string;
  /** moduleID前缀 */
  prefix?: string;
  cwd?: string;
  /** 不参与解析与调整的模块 */
  exlude?: string[];
  /** 不参与解析，只快速调整的模块 */
  exludeAnalyze?: string[];
  /** 自定义moduleID模块 */
  module?: IAmdHookCustomOption[];
}

interface IAmdHookCustomOption {
  /** 自定义moduleID */
  moduleId: string;
  /** 自定义module path */
  path: string;
}
