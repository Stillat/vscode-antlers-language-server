/* eslint-disable @typescript-eslint/no-namespace */
import * as path from 'path';
import { ExtensionContext, FileSystemWatcher, workspace } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';
import {
	languages, SemanticTokensLegend,
	DocumentSemanticTokensProvider, DocumentRangeSemanticTokensProvider, SemanticTokens
} from 'vscode';
import { RequestType, TextDocumentIdentifier, RequestType0, Range as LspRange, DidOpenTextDocumentNotification } from 'vscode-languageclient';
import { debounce } from 'ts-debounce';
import { activateAntlersDebug } from './debug/activateAntlersDebug';
import { TimingsLensProvider } from './debug/timingsLensProvider';
import { resetTimings } from './debug/antlersDebug';
import *  as vscode from 'vscode';

interface SemanticTokenParams {
	textDocument: TextDocumentIdentifier;
	ranges?: LspRange[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ReindexParams { }

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LockEditsParams { }

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ProjectUpdateParams { }

namespace ReindexRequest {
	export const type: RequestType<ReindexParams, null, any> = new RequestType('antlers/reindex');
}

namespace LockEditsRequest {
	export const type: RequestType<LockEditsParams, null, any> = new RequestType('antlers/lockedits');
}

namespace ProjectUpdateRequest {
	export const type: RequestType<ProjectUpdateParams, null, any> = new RequestType('antlers/projectUpdate');
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ManifestAvailableParams {

}

namespace ManifestAvailableRequest {
	export const type: RequestType<ReindexParams, null, any> = new RequestType('antlers/loadManifest');
}

namespace SemanticTokenRequest {
	export const type: RequestType<SemanticTokenParams, number[] | null, any> = new RequestType('antlers/semanticTokens');
}

namespace SemanticTokenLegendRequest {
	export const type: RequestType0<{ types: string[]; modifiers: string[] } | null, any> = new RequestType0('antlers/semanticTokenLegend');
}

let didChangeHtmlComments = false;
let client: LanguageClient;
let phpWatcher: FileSystemWatcher | null = null,
	composerWatcher: FileSystemWatcher | null = null,
	manifestWatcher: FileSystemWatcher | null = null,
	projectWatcher: FileSystemWatcher | null = null;

let isClientReady = false;

function askForProjectUpdate() {
	if (isClientReady) {
		client.sendRequest(ProjectUpdateRequest.type, {});
	}
}

function askForIndex() {
	if (isClientReady) {
		client.sendRequest(ReindexRequest.type, {});
	}
}

function sendManifestReloadRequest() {
	if (isClientReady) {
		client.sendRequest(ManifestAvailableRequest.type, {});
	}
}

const debouncedAskForIndex = debounce(askForIndex, 350);
const debounceAskForProjectUpdate = debounce(askForProjectUpdate, 350);
const debouncedManifestLoaded = debounce(sendManifestReloadRequest, 350);

let shouldUsePrettierFirst = false;

export function activate(context: ExtensionContext) {
	const antlersOverrideHtmlComments = workspace.getConfiguration().get('antlersOverrideHtmlComments'),
		tempShouldUsePrettierFirst = workspace.getConfiguration().get('antlersFormatWithPrettierFirstIfAvailable');

	if (typeof tempShouldUsePrettierFirst !== 'undefined' && tempShouldUsePrettierFirst === true) {
		shouldUsePrettierFirst = true;
	}

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
			provideDocumentFormattingEdits: async (doc, options, token, next) => {
				if (shouldUsePrettierFirst) {
					const prettierVscode = vscode.extensions.getExtension('esbenp.prettier-vscode');

					if (typeof prettierVscode !== 'undefined' && prettierVscode !== null && prettierVscode.isActive) {
						await client.sendRequest(LockEditsRequest.type, {}).then(async () => {
							await vscode.commands.executeCommand('prettier.forceFormatDocument');
							
							const formattingResults = await next(doc, options, token);
							const edits = new vscode.WorkspaceEdit();
							edits.set(doc.uri, formattingResults);
							vscode.workspace.applyEdit(edits);
						});
					}
				} else {
					const formattingResults = await next(doc, options, token);
					const edits = new vscode.WorkspaceEdit();
					edits.set(doc.uri, formattingResults);
					vscode.workspace.applyEdit(edits);
				}
				return null;
			}
		}
	};

	workspace.onDidChangeConfiguration((e) => {
		if (e.affectsConfiguration('antlersFormatWithPrettierFirstIfAvailable')) {
			const newPrettierSetting = workspace.getConfiguration().get('antlersFormatWithPrettierFirstIfAvailable');

			if (typeof newPrettierSetting !== 'undefined' && newPrettierSetting === true) {
				shouldUsePrettierFirst = true;
			} else {
				shouldUsePrettierFirst = false;
			}
		}

		if (e.affectsConfiguration('antlersOverrideHtmlComments')) {
			const newHtmlCommentSetting = workspace.getConfiguration().get('antlersOverrideHtmlComments');

			if (typeof newHtmlCommentSetting !== 'undefined' && newHtmlCommentSetting === true) {
				didChangeHtmlComments = true;

				vscode.languages.setLanguageConfiguration('html', {
					comments: {
						blockComment: ['{{#', '#}}']
					}
				});
			} else {
				didChangeHtmlComments = false;
				vscode.languages.setLanguageConfiguration('html', {
					comments: {
						blockComment: ['<!--', '-->']
					}
				});
			}
		}
	});

	if (typeof antlersOverrideHtmlComments !== 'undefined' && antlersOverrideHtmlComments === true) {
		didChangeHtmlComments = true;
		vscode.languages.setLanguageConfiguration('html', {
			comments: {
				blockComment: ['{{#', '#}}']
			}
		});
	}

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

	phpWatcher = workspace.createFileSystemWatcher('**/*.php');
	composerWatcher = workspace.createFileSystemWatcher('**/composer.lock');
	manifestWatcher = workspace.createFileSystemWatcher('**/.antlers.json');
	projectWatcher = workspace.createFileSystemWatcher('**/*.yaml');

	projectWatcher.onDidDelete(() => { debounceAskForProjectUpdate(); });
	projectWatcher.onDidCreate(() => { debounceAskForProjectUpdate(); });
	projectWatcher.onDidChange(() => { debounceAskForProjectUpdate(); });

	manifestWatcher.onDidDelete(() => { debouncedManifestLoaded(); });
	manifestWatcher.onDidCreate(() => { debouncedManifestLoaded(); });
	manifestWatcher.onDidChange(() => { debouncedManifestLoaded(); });

	composerWatcher.onDidChange(() => { debouncedAskForIndex(); });
	composerWatcher.onDidCreate(() => { debouncedAskForIndex(); });
	composerWatcher.onDidDelete(() => { debouncedAskForIndex(); });

	phpWatcher.onDidChange(() => { debouncedAskForIndex(); });
	phpWatcher.onDidCreate(() => { debouncedAskForIndex(); });
	phpWatcher.onDidDelete(() => { debouncedAskForIndex(); });

	activateAntlersDebug(context);

	// Start the client. This will also launch the server
	const disposable = client.start();
	toDispose.push(disposable);
	client.onReady().then(() => {
		isClientReady = true;

		sendManifestReloadRequest();

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
	});
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}

	if (didChangeHtmlComments) {
		vscode.languages.setLanguageConfiguration('html', {
			comments: {
				blockComment: ['<!--', '-->']
			}
		});
	}

	phpWatcher?.dispose();
	composerWatcher?.dispose();
	manifestWatcher?.dispose();

	return client.stop();
}
