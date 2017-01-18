# APICloud For VSCode -- 适用于vsCode编辑器的APICloud开发工具


## 简介

个人为 VSCode 编辑器推出的开发工具包.包含新建应用模板,WiFi真机同步,实时预览,代码提示自动完成,流式日志输出等核心功能.最新加入了apicloud-polyfill

## 安装

在插件中心搜索： apicloud

## 快捷键

* wifi 页面预览 Alt + o
* wifi 增量同步 Alt + i
* wifi 启动wifi Alt + w

## 特性

* 支持 Mac/Windows/Linux等主流操作系统;
* 基于 [apicloud-tools-core](https://www.npmjs.com/package/apicloud-tools-core) 核心工具库开发;
* 包含四个默认应用模板与26个默认页面模板;
* 支持 WiFi 增量/全量 更新;
* 基于事件机制的流式日志输出;
* 代码基于 *GPL-3.0* 开源,可自由定制与扩展;
* 支持在 VSCode 控制台实时调试插件本身的代码;
* 开启/关闭 WiFi 服务;
* 提取集成了 [apicloud-polyfill](https://github.com/apicloudcom/apicloud-polyfill) 可以直接使用最新的 es6,es7语法,在 JS 层以模块化的方式,高效优雅地开发APICloud 应用. 
* 支持显示实时连接设备数;

## 使用

1. 在APICloud官网下载并安装最新的APPLoader到手机上,下载地址:[http://docs.apicloud.com/Download/download](http://docs.apicloud.com/Download/download)
2. 安装 apicloud插件后,VSCode;
3. 打开VSCode的命令面板(快捷键 Ctrl+shift+p),输入apicloud,即可使用相关APICloud开发功能;
4. 一切同步功能必须先开启wifi服务
5. 使用apicloud-polyfill 需要先 polyfill初始化 在运行 **npm i**  注意：同步wifi时 先使用**.syncignore**忽略node_modules目录不然同步很慢文件很多
5. 反馈地址：[APICloud 官方论坛](http://community.apicloud.com/bbs/forum.php?mod=viewthread&tid=48763)

## 自定义真机同步时想要忽略的文件或目录

核心库及其衍生工具插件,支持在项目根目录添加 **.syncignore** 文件,来自定义想在在真机同步时忽略的文件.这一功能,对于那些基于webpack等自动化工具构建项目的开发者来说,意义重大.

不同于svn/git等的ignore,核心库真机同步的 ignore 功能基于[node-glob](https://github.com/isaacs/node-glob)开发,支持标准的[Glob](https://github.com/isaacs/node-glob#glob-primer)表达式.

### 常用格式示例

* 忽略某一类型的文件,如 *.js.map 文件:

```
**/*.js.map
```

* 忽略项目中所有某一名称的文件夹极其子文件(夹),如node_modules目录:

```
**/node_modules/**
```

* 忽略根目录中某一目录下的所有文件(夹),如src目录:

```
src/**
```

* 基于自动化webpack等自动化构建工具常用的表达式:

```
{**/*.js.map,**/node_modules/**,src/**}

```


## 演示
![IDE](http://hongkai.me/public/apicloud/GIF.gif)
![IDE](http://hongkai.me/public/apicloud/GIF3.gif)
