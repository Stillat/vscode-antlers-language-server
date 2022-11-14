import * as vscode from 'vscode';
import { IDocumentationResult } from './documentationTypes';
import { getUri } from '../utils/getUri';

class HelpPanel {
    public static currentPanel: HelpPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, docsResult: IDocumentationResult) {
        this._panel = panel;

        this._panel.onDidDispose(this.dispose, null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri, docsResult);
        this._setWebviewMessageListener(this._panel.webview);
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, docsResult: IDocumentationResult) {
        const stylesUri = getUri(webview, extensionUri, ["docsui", "build", "assets", "index.css"]),
              scriptUri = getUri(webview, extensionUri, ["docsui", "build", "assets", "index.js"]),
              helpData = Buffer.from(JSON.stringify(docsResult.documentation), 'binary').toString('base64');

        return /*html*/ `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link rel="stylesheet" type="text/css" href="${stylesUri}">
              <title>${docsResult.documentation.handle} Help</title>
            </head>
            <body>
              <div id="app"></div>
              <script>
                window['__toolboxHelpData'] = JSON.parse(atob('${helpData}'));
              </script>
              <script src="${scriptUri}"></script>
            </body>
          </html>
        `;
    }

    /**
     * Sets up an event listener to listen for messages passed from the webview context and
     * executes code based on the message that is recieved.
     *
     * @param webview A reference to the extension webview
     * @param context A reference to the extension context
     */
    private _setWebviewMessageListener(webview: vscode.Webview) {
    }

    public static render(extensionUri: vscode.Uri, docsResult: IDocumentationResult) {
        if (docsResult.resolved == false) {
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'antlersLanguageServer.documentation',
            docsResult.documentation.field.handle + ' Help',
            vscode.ViewColumn.One, {
            enableScripts: true
        });

        HelpPanel.currentPanel = new HelpPanel(panel, extensionUri, docsResult);
    }

    public dispose() {
        HelpPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}

export default HelpPanel;
