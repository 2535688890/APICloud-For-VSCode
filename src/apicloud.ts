import { window as Window, workspace as Workspace } from 'vscode';
import { outputChannel } from './output';
var fse = require('fs-extra');
var path = require('path');
var prompt = require('prompt');
const WifiSync = require("./WifiSync");
const file_template_path = "../../template/file_template";
const app_template_path = "../../template/app_template";
const clock_show_path = "../../template/clock-show";
const file_template_config = {
  "page001": "dianping-classify",
  "page002": "dianping-group",
  "page003": "dianping-home",
  "page004": "dianping-info",
  "page005": "dianping-merchant",
  "page006": "dianping-mine",
  "page007": "dianping-movie",
  "page008": "dianping-orderDetail",
  "page009": "souhu-hot",
  "page010": "souhu-recommend",
  "page011": "tianmao-home",
  "page012": "tianmao-mine",
  "page013": "tianmao-shopping",
  "page014": "wangyimusic-down",
  "page015": "elema-1",
  "page016": "elema-2",
  "page017": "qiushibaike",
  "page018": "qq-movie-1",
  "page019": "qq-movie-2",
  "page020": "tuniu-1",
  "page021": "tuniu-2",
  "page022": "wangyi-music",
  "page023": "wangyi-news-1",
  "page024": "wangyi-news-2",
  "page025": "wangyi-news-3",
  "page026": "wangyi-news-4"
}
const app_template_config = { "default": "空白应用", "bottom": "底部导航", "home": "首页导航", "slide": "侧边导航" }

const APICloud = {
  appTemplateConfig() { // 应用模板配置.
    return app_template_config;
  },
  fileTemplateConfig() { // 文件模板配置.
    return file_template_config;
  },
  startWifi({port}) {/* 启动wifi服务. */
    return WifiSync.start({ port: port });
  },
  endWifi({}) { /* 停止 wifi 服务. */
    return WifiSync.end({});
  },
  syncWifi({projectPath, syncAll}) { /* wifi 增量/全量同步. */
    return WifiSync.sync({ project: projectPath, updateAll: syncAll });
  },
  previewWifi({file}) { /* 预览. */
    if (!file || "" === file) {
      console.error("预览路径不能为空!");
      outputChannel.appendLine("预览路径不能为空!");
      return;
    }

    return WifiSync.preview({ file: file });
  },
  polyfill({output}) {
    fse.copy(path.resolve(__dirname,clock_show_path), output, function (err) {
      // console.error(`开始运行了` )
      if (err) {
        outputChannel.appendLine(`polyfill初始化 失败:` + err);
        return console.error(`polyfill初始化 失败:` + err)
      }
      console.log('polyfill初始化 成功!')
      outputChannel.appendLine(`polyfill初始化 成功!`);
    }) // copies directory, even if it has subdirectories or files
  },
  wifiInfo() { /* 获取wifi配置信息,如端口号等. */
    // 注意: 这个要动态获取.
    const wifiInfo = {
      ip: WifiSync.localIp(),
      port: WifiSync.port, clientsCount: WifiSync.clientsCount
    }
    return wifiInfo;
  },
  wifiLog(callback) {
    return new Promise(resolve => {
      WifiSync.on("log", (log) => {
        callback(log);
        resolve();
      });
    });
  },
  init({name, template, output}) {
    name += ""
    template += ""
    output += ""

    if (!app_template_config[template]) {
      console.error(`不支持的模板类型:${template} 可选模板: ${Object.keys(app_template_config)}`);
      outputChannel.appendLine(`不支持的模板类型:${template} 可选模板: ${Object.keys(app_template_config)}`);
      return;
    }


    this.validatePackageName(name);

    var root = path.resolve(output, name);

    if (fse.existsSync(root)) {
      this.createAfterConfirmation(name, template, output);
    } else {
      this.createProject(name, template, output);
    }
  },
  addFileTemplate({name, output, template}) {
    name += "";
    output += "";
    template += "";

    const realTemplateName = file_template_config[template];
    if (!realTemplateName) {
      console.error(`找不到页面框架模板:${template},目前支持的页面模板为:${Object.keys(file_template_config)}`);
      outputChannel.appendLine(`找不到页面框架模板:${template},目前支持的页面模板为:${Object.keys(file_template_config)}`);
      return;
    }

    var root = path.resolve(output);
    var configPath = path.resolve(output, "config.xml");

    if (!fse.existsSync(root) || !fse.existsSync(configPath)) {
      console.error(`${root} 不是一个有效的APICloud项目!`);
      outputChannel.appendLine(`${root} 不是一个有效的APICloud项目!`);
      return;
    }

    try {
      let templatePath = path.join(__dirname, file_template_path, realTemplateName)

      fse.walk(templatePath)
        .on('data', function (item) {
          let itemPath = item.path;
          let itemStats = item.stats;

          let relativePath = path.relative(templatePath, itemPath);
          let targetPath = path.resolve(root, relativePath);
          let targetDir = path.dirname(targetPath);

          if (itemStats.isDirectory()) { // 说明是目录.
            return;
          }

          let fileName = path.basename(targetPath);
          fileName = fileName.replace(/apicloudFrame|apicloudWindow(?=\.html)/g, (match) => {
            let matchDict = {
              "apicloudFrame": `${name}_frame`,
              "apicloudWindow": `${name}_window`
            }
            return matchDict[match];
          })

          targetPath = path.resolve(targetDir, fileName)
          fse.copySync(itemPath, targetPath, { filter: () => (! /^[.]+/.test(fileName)) })

          if (/\.html$/.test(fileName)) {
            let targetFileText = fse.readFileSync(targetPath, 'utf8');
            targetFileText = targetFileText.replace(/apicloudFrame|apicloudWindow/g, (match) => {
              let matchDict = {
                "apicloudFrame": `${name}_frame`,
                "apicloudWindow": `${name}_window`
              }
              return matchDict[match];
            })

            fse.writeFileSync(targetPath, targetFileText);
          }
        })
        .on('end', function () {
          return;
        })
    } catch (err) {
      console.error(`创建 APICloud 页面框架失败: ` + err);
      outputChannel.appendLine(`创建 APICloud 页面框架失败: ` + err);
      return
    }
  },
  validatePackageName(name) {
    if (!name.match(/^[\w]{1,20}$/i)) {
      console.error(
        '"%s" 应用名称无效. 应用名称应在20个字符以内,且不能包含空格和符号!',
        name
      );
      outputChannel.appendLine(name + ' 应用名称无效. 应用名称应在20个字符以内,且不能包含空格和符号!');
      return
    }
  },
  createAfterConfirmation(name, template, output) {
    prompt.start();

    var property = {
      name: 'yesno',
      message: '目录 ' + path.resolve(output, name) + ' 已存在. 是否继续?',
      validator: /[是|否]+/,
      warning: '必须回复 是 或 否',
      default: '否'
    };

    prompt.get(property, (err, result) => {
      if (result.yesno === '是') {
        this.createProject(name, template, output);
      } else {
        return;
      }
    });
  },
  createProject(name, template, output) {
    var root = path.resolve(output, name)

    if (!fse.existsSync(root)) {
      fse.mkdirSync(root);
    }

    try {
      let templatePath = path.join(__dirname, app_template_path, template);
      fse.copySync(templatePath, root);

      let configFilePath = path.join(root, "config.xml");
      let configText = fse.readFileSync(configFilePath, 'utf8');
      configText = configText.replace(/\<name\>.*\<\/name\>/g, `<name>${name}</name>`);
      fse.writeFileSync(configFilePath, configText, 'utf8');

      return;
    } catch (err) {
      outputChannel.appendLine(`创建APICloud项目失败:` + err);
      console.error(`创建APICloud项目失败:` + err)
      return;
    }
  }
}

export default APICloud

module.exports = APICloud
//  module.export = APICloud
