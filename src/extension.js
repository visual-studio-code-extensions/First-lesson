"use strict";
exports.__esModule = true;
exports.deactivate = exports.activate = void 0;
var vscode_1 = require("vscode");
var ts_morph_1 = require("ts-morph");
function activate(context) {
    console.log('Congratulations, your extension "firstlesson" is now active!');
    var project = new ts_morph_1.Project({
        useInMemoryFileSystem: true
    });
    var saveevent = vscode_1.workspace.onDidSaveTextDocument(function (file) {
        var sourceFile = project.createSourceFile("__temp__.ts", file.getText());
        console.log(sourceFile);
    });
    var disposable = vscode_1.commands.registerCommand("firstlesson.SeeTree", function () {
        var view = vscode_1.window.createWebviewPanel("webtree", "seetree", vscode_1.ViewColumn.Two);
        view.webview.html = "\n      <!DOCTYPE html>\n\t\t\t<html>\n        <head>\n          <title>Page Title</title>\n        </head>\n   \n        <body>  \n          <h1>This is a Heading</h1>\n          <p>This is a paragraph.</p>\n        </body>\n      </html>\n    ";
    });
    context.subscriptions.push(disposable, saveevent);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
