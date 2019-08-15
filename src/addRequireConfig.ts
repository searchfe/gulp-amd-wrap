import { File } from 'gulp-util';
import { readdirSync, statSync, readFileSync} from 'fs';
import { dirname, resolve, relative, basename} from 'path';
var Transform = require('readable-stream/transform');

/** 解析所有文件的moduleID, 生成config后插到入口文件的头部 */
export function addRequireConfig(option: optionType) {
    let mainJs = option.mainJs || 'main.js';
    let pathConfig: object = {};
    let mainFile;
    return new Transform({
        objectMode: true,
        // 从每个文件中读取moduleId, 保存到pathConfig对象中。
        transform: (file: File, enc, callback) => {
            let fileName = basename(file.path);
            // 主入口定义的moduleId不需要写到config里面
            if (fileName !== mainJs) {
                let touchModuleId = file.contents.toString().match(/^define\(["']([0-9a-zA-Z@_\-/]+)["']/);
                let moduleId = touchModuleId && touchModuleId[1];
                let relativePath = relative(option.sourceDir, file.path);
                if (moduleId) {
                    // {'@molecule/a/xxx': '/se/static/molecules/a/b/xx}
                    pathConfig[moduleId] = resolve(option.deloyDir,relativePath).replace(/.js$/, '');
                }
            } else {
                mainFile = file;
            }
            callback(null, file);
        },
        // 将pathConfig对象中的moduleId打印成config文件，塞入主文件main.js
        flush(callback) {
            let finalConfig = 'require.config({paths:' + JSON.stringify(pathConfig) + '});\n';
            console.log('finalConfig: ', finalConfig);
            mainFile.contents = new Buffer(finalConfig + mainFile.contents.toString());
            this.push(mainFile);
            console.log(this.length);
            callback();
        }
    })
}
// 遍历目录，找到所有文件。
function walk(dir:string) {
    let results : string[] = [];
    let list = readdirSync(dir);
    list.forEach(function(item) {
        item = dir + '/' + item;
        var stat = statSync(item);
        if (stat && stat.isDirectory()) {
            /* Recurse into a subdirectory */
            results = results.concat(walk(item));
        } else {
        /* Is a file */
            results.push(item);
        }
    });
    return results;
}
interface optionType {
    mainJs?: string,
    /** 线上部署地址 如/se/static/molecules/toptip/ */
    deloyDir: string,
    /** 编译前脚本路径，用于计算文件相对位置。得出'./static/script/a.js'后与deployDir拼接 */
    sourceDir: string
}

