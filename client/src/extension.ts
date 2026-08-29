/* eslint-disable @typescript-eslint/no-namespace */
import * as path from 'path';
import { ExtensionContext, FileSystemWatcher, workspace } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';
import {
    languages, SemanticTokensLegend,
    DocumentSemanticTokensProvider, DocumentRangeSemanticTokensProvider, SemanticTokens
} from 'vscode';
import { RequestType, TextDocumentIdentifier, RequestType0, Range as LspRange, DidOpenTextDocumentNotification, NotificationType } from 'vscode-languageclient';
import { debounce } from 'ts-debounce';
import { activateAntlersDebug } from './debug/activateAntlersDebug';
import { TimingsLensProvider } from './debug/timingsLensProvider';
import { resetTimings } from './debug/antlersDebug';
import *  as vscode from 'vscode';
import { ProjectExplorer } from './project/projectExplorer';
import { IProjectFields } from './project/types';
import { resolveHtmlBlockComment } from './utils/commentConfiguration';

interface SemanticTokenParams {
    textDocument: TextDocumentIdentifier;
    ranges?: LspRange[];
}

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

interface ProjectDetailsParams {
    content: IProjectFields;
}

namespace ProjectUpdatedNotification {
    export const type = new NotificationType<ProjectDetailsParams>('antlers/projectDetailsAvailable');
}

namespace SemanticTokenRequest {
    export const type: RequestType<SemanticTokenParams, number[] | null, any> = new RequestType('antlers/semanticTokens');
}

namespace SemanticTokenLegendRequest {
    export const type: RequestType0<{ types: string[]; modifiers: string[] } | null, any> = new RequestType0('antlers/semanticTokenLegend');
}

let client: LanguageClient;
let projectWatcher: FileSystemWatcher | null = null;
let projectExplorer:ProjectExplorer;
let isClientReady = false;
let htmlCommentConfiguration: vscode.Disposable | undefined;

function askForProjectUpdate() {
    if (isClientReady) {
        client.sendRequest(ProjectUpdateRequest.type, {});
    }
}

const debounceAskForProjectUpdate = debounce(askForProjectUpdate, 350);

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

    projectExplorer = new ProjectExplorer(context);

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

    projectWatcher = workspace.createFileSystemWatcher('**/*.{yaml,php,json}');

    projectWatcher.onDidDelete(() => { debounceAskForProjectUpdate(); });
    projectWatcher.onDidCreate(() => { debounceAskForProjectUpdate(); });
    projectWatcher.onDidChange(() => { debounceAskForProjectUpdate(); });

    activateAntlersDebug(context);

    // Start the client. This will also launch the server
    await client.start();
    isClientReady = true;

    client.onNotification(ProjectUpdatedNotification.type, (f) => {
        if (projectExplorer != null) {
            projectExplorer.updateStructure(f.content);
        }
    });

    setTimeout(() => {
        client.sendRequest(SemanticTokenLegendRequest.type).then(legend => {
            if (legend) {
                const provider: DocumentSemanticTokensProvider & DocumentRangeSemanticTokensProvider = {
                    provideDocumentSemanticTokens(doc) {
                        const params: SemanticTokenParams = {
                            textDocument: client.code2ProtocolConverter.asTextDocumentIdentifier(doc),
                        };
                        return client.sendRequest(SemanticTokenRequest.type, params).then(data => {
                            return data && new SemanticTokens(new Uint32Array(data));
                        });
                    },
                    provideDocumentRangeSemanticTokens(doc, range) {
                        const params: SemanticTokenParams = {
                            textDocument: client.code2ProtocolConverter.asTextDocumentIdentifier(doc),
                            ranges: [client.code2ProtocolConverter.asRange(range)]
                        };
                        return client.sendRequest(SemanticTokenRequest.type, params).then(data => {
                            return data && new SemanticTokens(new Uint32Array(data));
                        });
                    }
                };
                toDispose.push(languages.registerDocumentSemanticTokensProvider(documentSelector, provider, new SemanticTokensLegend(legend.types, legend.modifiers)));
            }
        });
    }, 2500);
}

export function deactivate(): Thenable<void> | undefined {
    htmlCommentConfiguration?.dispose();
    htmlCommentConfiguration = undefined;

    if (!client) {
        return undefined;
    }

    projectWatcher?.dispose();

    return client.stop();
}
