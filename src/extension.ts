//import { commands as Commands, ExtensionContext, window as Window, workspace as Workspace, ViewColumn} from 'vscode';
import * as vscode from 'vscode';
import { outputChannel } from './output';
const apicloud = require('./apicloud');
export const activate = function (context: vscode.ExtensionContext) {
    console.log('恭喜,您的扩展“apicloud”现在已经激活!');
    var config = vscode.workspace.getConfiguration('apicloud');
    const disposables = [
        vscode.commands.registerCommand('apicloud.startWifi', () => {//启动wifi
            apicloud.startWifi()
        }),
        vscode.commands.registerCommand('apicloud.wifiInfo', () => {//查看wifi状态
            let {port, ip, clientsCount} = apicloud.wifiInfo()
            let tip = `监听IP :${JSON.stringify(ip)}  端口:${port}  设备连接数:${clientsCount}`
            outputChannel.appendLine(tip);
        }),
        vscode.commands.registerCommand('apicloud.endWifi', () => {//停止wifi
            apicloud.endWifi({});
        }),
        vscode.commands.registerCommand('apicloud.previewWifi', () => {//预览页面  
            // console.log(Window.activeTextEditor.document.fileName);

            // let file = Workspace.rootPath + '/index.html';
            apicloud.previewWifi({ file: vscode.window.activeTextEditor.document.fileName });
        }),
        vscode.commands.registerCommand('apicloud.wifiLog', () => {//wifiLog
            apicloud.wifiLog();
        }),
        vscode.commands.registerCommand('apicloud.syncWifi1', () => {//增量更新
            //console.log(vscode.workspace.rootPath);
            var projectPath = vscode.workspace.rootPath+config.get('subdirectories');
            apicloud.syncWifi({ projectPath: projectPath, syncAll: false });
        }),
        vscode.commands.registerCommand('apicloud.syncWifi2', () => {//全量更新
            var projectPath = vscode.workspace.rootPath+config.get('subdirectories');
            apicloud.syncWifi({ projectPath: projectPath, syncAll: true });
        }),
        vscode.commands.registerCommand('apicloud.polyfill', () => { //polyfill初始化
            apicloud.polyfill({ output: vscode.workspace.rootPath });
        }),
        //Commands.registerCommand('apicloud.addFileTemplate', apicloud2.addFileTemplate),//模板
        vscode.commands.registerCommand('apicloud.init1', () => {
            apicloud.init({ name: "HelloAPICloud", template: 'default', output: vscode.workspace.rootPath });
        }),
        vscode.commands.registerCommand('apicloud.init2', () => {
            apicloud.init({ name: "HelloAPICloud", template: 'bottom', output: vscode.workspace.rootPath });
        }),
        vscode.commands.registerCommand('apicloud.init3', () => {
            apicloud.init({ name: "HelloAPICloud", template: 'home', output: vscode.workspace.rootPath });
        }),
        vscode.commands.registerCommand('apicloud.init4', () => {
            apicloud.init({ name: "HelloAPICloud", template: 'slide', output: vscode.workspace.rootPath });
        }),
    ];
    if (config.get('start_wifi')) apicloud.startWifi();
    context.subscriptions.push(...disposables);
}


export function deactivate() {
}