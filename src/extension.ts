//import { commands as Commands, ExtensionContext, window as Window, workspace as Workspace, ViewColumn} from 'vscode';
import * as vscode from 'vscode';
import { outputChannel } from './output';
const apicloud = require('./apicloud');
var path = require("path");
var fileUrl = require("file-url");

export const activate = function (context: vscode.ExtensionContext) {
    ///页面预览
    var previewUri;
    var provider;
    var registration;
        vscode.workspace.onDidChangeTextDocument(function (e) {
        if (e.document === vscode.window.activeTextEditor.document) {
            provider.update(previewUri);
        }
    });
        function sendHTMLCommand(displayColumn) {
        // var previewTitle = "实时预览: '" + path.basename(vscode.window.activeTextEditor.document.fileName) + "'";
        var previewTitle = "实时预览";
        provider = new HtmlDocumentContentProvider();
        registration = vscode.workspace.registerTextDocumentContentProvider("html-preview", provider);
        previewUri = vscode.Uri.parse("html-preview://preview/" + previewTitle);
        return vscode.commands.executeCommand("vscode.previewHtml", previewUri, displayColumn).then(function (success) {
        }, function (reason) {
            console.warn(reason);
            vscode.window.showErrorMessage(reason);
        });
    }
//预览结束
    // console.log('恭喜,您的扩展“apicloud”现在已经激活!');
    outputChannel.show();

    const disposables = [
        vscode.commands.registerCommand('apicloud.startWifi', () => {//启动wifi
            apicloud.startWifi({ port: 23456 })
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
            apicloud.wifiLog(({level, content}) => {
                if (level === "warn") {
                    //console.warn(content)
                    outputChannel.appendLine(content);
                    return;
                }
                if (level === "error") {
                    //console.error(content)
                    outputChannel.appendLine(content);
                    return;
                }
                //console.log(content);
                outputChannel.appendLine(content);
            }).then(() => {
                //console.log('WiFi 日志服务已启动..');
                outputChannel.show();
            });
            outputChannel.appendLine('WiFi 日志服务已启动..');
        }),
        vscode.commands.registerCommand('apicloud.syncWifi1', () => {//增量更新
            console.log(vscode.workspace.rootPath);
            apicloud.syncWifi({ projectPath: vscode.workspace.rootPath, syncAll: false });
        }),
        vscode.commands.registerCommand('apicloud.syncWifi2', () => {//全量更新
            apicloud.syncWifi({ projectPath: vscode.workspace.rootPath, syncAll: true });
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
        vscode.commands.registerCommand('apicloud.previewSide', () => {
            var displayColumn;
        switch (vscode.window.activeTextEditor.viewColumn) {
            case vscode.ViewColumn.One:
                displayColumn = vscode.ViewColumn.Two;
                break;
            case vscode.ViewColumn.Two:
            case vscode.ViewColumn.Three:
                displayColumn = vscode.ViewColumn.Three;
                break;
        }
        return sendHTMLCommand(displayColumn);
        })
    ];

    context.subscriptions.push(...disposables);
}


var SourceType;
(function (SourceType) {
    SourceType[SourceType["SCRIPT"] = 0] = "SCRIPT";
    SourceType[SourceType["STYLE"] = 1] = "STYLE";
})(SourceType || (SourceType = {}));
var HtmlDocumentContentProvider = (function () {
    function HtmlDocumentContentProvider() {
        this._onDidChange = new vscode.EventEmitter();
    }
    HtmlDocumentContentProvider.prototype.provideTextDocumentContent = function (uri) {
        return this.createHtmlSnippet();
    };
    Object.defineProperty(HtmlDocumentContentProvider.prototype, "onDidChange", {
        get: function () {
            return this._onDidChange.event;
        },
        enumerable: true,
        configurable: true
    });
    HtmlDocumentContentProvider.prototype.update = function (uri) {
        this._onDidChange.fire(uri);
    };
    HtmlDocumentContentProvider.prototype.createHtmlSnippet = function () {
        var editor = vscode.window.activeTextEditor;
        if (editor.document.languageId !== "html" && editor.document.languageId !== "jade") {
            return this.errorSnippet("无法预览可能文件格式不支持");
        }
        return this.preview(editor);
    };
    HtmlDocumentContentProvider.prototype.errorSnippet = function (error) {
        return "\n                <body>\n                    " + error + "\n                </body>";
    };
    HtmlDocumentContentProvider.prototype.createLocalSource = function (file, type) {
        var source_path = fileUrl(path.join(__dirname, "..", "..", "static", file));
        switch (type) {
            case SourceType.SCRIPT:
                return "<script src=\"" + source_path + "\"></script>";
            case SourceType.STYLE:
                return "<link href=\"" + source_path + "\" rel=\"stylesheet\" />";
        }
    };
    HtmlDocumentContentProvider.prototype.fixLinks = function (document, documentPath) {
        return document.replace(new RegExp("((?:src|href)=[\'\"])((?!http|\\/).*?)([\'\"])", "gmi"), function (subString, p1, p2, p3) {
            return [
                p1,
                fileUrl(path.join(path.dirname(documentPath), p2)),
                p3
            ].join("");
        });
    };
    HtmlDocumentContentProvider.prototype.preview = function (editor) {
        var doc = editor.document;
        return this.createLocalSource("header_fix.css", SourceType.STYLE) + this.fixLinks(doc.getText(), doc.fileName);
    };
    return HtmlDocumentContentProvider;
}());


export function deactivate() {
}