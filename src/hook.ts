/*
 * @Author: qiansc
 * @Date: 2019-04-23 11:17:36
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-10-16 19:32:26
 */

import { File, PluginError } from 'gulp-util';
import path = require('path');
import { include } from './filter';
import { parseAbsolute, parseBase, aliasConf } from './moduleID';
import { Parser } from './parser';
import stream = require('readable-stream');
const Transform = stream.Transform;

export function amdWrap(option: IAmdWrap) {
  return new Transform({
    objectMode: true,
    transform: (file: File, enc, callback) => {
      if (path.extname(file.path) !== '.js') {
          return callback(null, file);
      }
      // 如果传入多个文件，且文件各配置不同，confAboutFile需要被传入，这样才能依据配置对文件进行处理。
      if (option.confAboutFile && option.confAboutFile[path.relative(process.cwd(), file.path)]) {
          option = Object.assign(option.confAboutFile[path.relative(process.cwd(), file.path)]
          , {confAboutFile: option.confAboutFile});
      }
      // 传入baseUrl则moduleid基于baseUrl计算
      const baseUrl = option.baseUrl || file.base;
      const prefix = option.prefix || '';
      const useMd5 = option.useMd5 || false;
      const alias: aliasConf[] = [];
      if (option.alias) {
        option.alias.forEach(a => {
          alias.push({
            moduleId: a.moduleId,
            path: parseAbsolute(baseUrl, a.path)
          });
        });
      };
      // let location = parseBase(file.path);
      if (include(file.path, option.exclude, option.baseUrl)) {
        // 在exlude名单中 do nothing
        // console.log('ignore', file.path);
        callback(null, file);
      } else {
        const parser = new Parser(file.contents, file.path, baseUrl, prefix, alias, option.staticBaseUrl);
        parser.hook({
          removeModuleId: include(file.path, option.anonymousModule, option.baseUrl),
          useMd5,
        });
        file.contents = Buffer.from(parser.getContent());
        file.moduleId = parser.getModuleId();
        file.dependences = parser.getDependences();
        callback(null, file);
      }
    },
  });
}

interface IAmdWrap {
  /** 即项目根目录。用来配置模块查找根目录 */
  baseUrl?: string;
  /** moduleID前缀 */
  prefix?: string;
  cwd?: string;
  /** 不参与解析与调整的模块 */
  exclude?: string[];
  /** 不参与解析，只快速调整的模块 */
  exludeAnalyze?: string[];
  /** 自定义moduleID模块 */
  alias?: aliasConf[]
  moduleId?: string;
  /** 不参与生成moduleId的模块 */
  anonymousModule?: string[];
  /** 配置文件路径 */
  confAboutFile?: any;
  /** 静态资源的根目录 */
  staticBaseUrl?: string;
  /** 生成的ModuleId 是否需要md5后缀来避免其他模块引用 如 @molecule/toptip2_134dfas */
  useMd5?: any;
}
