/* eslint-disable @typescript-eslint/no-namespace */
import * as path from 'path';
import { ExtensionContext, workspace } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';
import { languages } from 'vscode';
import { RequestType, DidOpenTextDocumentNotification } from 'vscode-languageclient';
import { activateAntlersDebug } from './debug/activateAntlersDebug';
import { TimingsLensProvider } from './debug/timingsLensProvider';
import { resetTimings } from './debug/antlersDebug';
import *  as vscode from 'vscode';
import { resolveHtmlBlockComment } from './utils/commentConfiguration';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LockEditsParams { }

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ProjectUpdateParams { }

interface DocumentTransformParams {
    content: string
}

interface TransformReplacement {
    find: string,
    replace: string
}

interface ForcedFormatParams {
    content: string,
    tabSize: number,
    insertSpaces: boolean
}

interface DocumentTransformResult {
    shouldParse: boolean,
    transformedText: string,
    replacements: TransformReplacement[]
}

namespace LockEditsRequest {
    export const type: RequestType<LockEditsParams, null, any> = new RequestType('antlers/lockedits');
}

namespace DocumentTransformRequest {
    export const type: RequestType<DocumentTransformParams, DocumentTransformResult, any> = new RequestType('antlers/transform');
}

namespace ForcedFormatRequest {
    export const type: RequestType<ForcedFormatParams, string, any> = new RequestType('antlers/forcedFormat');
}

namespace ProjectUpdateRequest {
    export const type: RequestType<ProjectUpdateParams, null, any> = new RequestType('antlers/projectUpdate');
}

let client: LanguageClient;
let isClientReady = false;
let htmlCommentConfiguration: vscode.Disposable | undefined;

export async function activate(context: ExtensionContext) {
    // The server is implemented in node
    const serverModule = context.asAbsolutePath(
        path.join('server', 'out', 'server.js')
    );

    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions
        }
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'html' }],
        middleware: {
            executeCommand: async (command, args, next) => {
                if (command == 'antlers.extractToPartial') {
                    const targetPath = await vscode.window.showSaveDialog({
                        title: 'Extract to Partial',
                    });
                    args.push(targetPath.path);
                    args.push(targetPath.fsPath);
                }
                return next(command, args);
            }
        }
    };

    const applyHtmlCommentConfiguration = (editor: vscode.TextEditor | undefined) => {
        htmlCommentConfiguration?.dispose();
        htmlCommentConfiguration = undefined;

        const overrideHtmlComments = workspace
            .getConfiguration(undefined, editor?.document?.uri)
            .get('antlersOverrideHtmlComments') === true;
        const blockComment = resolveHtmlBlockComment(editor?.document?.fileName, overrideHtmlComments);

        if (blockComment == null) {
            return;
        }

        htmlCommentConfiguration = vscode.languages.setLanguageConfiguration('html', {
            comments: { blockComment }
        });
    };

    applyHtmlCommentConfiguration(vscode.window.activeTextEditor);

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
        applyHtmlCommentConfiguration(editor);
    }));

    context.subscriptions.push(workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('antlersOverrideHtmlComments')) {
            applyHtmlCommentConfiguration(vscode.window.activeTextEditor);
        }
    }));

    context.subscriptions.push({
        dispose: () => {
            htmlCommentConfiguration?.dispose();
            htmlCommentConfiguration = undefined;
        }
    });

    context.subscriptions.push(
        vscode.commands.registerCommand("extension.antlersLanguageServer.reloadProjectDetails", () => {
            if (isClientReady) {
                client.sendRequest(ProjectUpdateRequest.type, {});
            }
        })
    );

    // Create the language client and start the client.
    client = new LanguageClient(
        'antlersLanguageServer',
        'Antlers Language Server',
        serverOptions,
        clientOptions
    );

    const toDispose = context.subscriptions,
        documentSelector = ['html', 'antlers'];

    const clDisposable = languages.registerCodeLensProvider(
        documentSelector,
        new TimingsLensProvider()
    );

    toDispose.push(clDisposable);

    workspace.onDidChangeTextDocument(_e => {
        resetTimings();
    });

    activateAntlersDebug(context);

    // Start the client. This will also launch the server
    await client.start();
    isClientReady = true;
}

export function deactivate(): Thenable<void> | undefined {
    htmlCommentConfiguration?.dispose();
    htmlCommentConfiguration = undefined;

    if (!client) {
        return undefined;
    }

    return client.stop();
}
