/* eslint-disable @typescript-eslint/no-namespace */
import * as path from 'path';
import { ExtensionContext, FileSystemWatcher, workspace } from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';
import {
	languages, SemanticTokensLegend,
	DocumentSemanticTokensProvider, DocumentRangeSemanticTokensProvider, SemanticTokens, extensions, commands
} from 'vscode';
import { RequestType, TextDocumentIdentifier, RequestType0, Range as LspRange } from 'vscode-languageclient';
import { debounce } from 'ts-debounce';
import { activateAntlersDebug } from './debug/activateAntlersDebug';
import { TimingsLensProvider } from './debug/timingsLensProvider';
import { resetTimings } from './debug/antlersDebug';

interface SemanticTokenParams {
	textDocument: TextDocumentIdentifier;
	ranges?: LspRange[];
}

interface ReloadAddonParams {
	extensionPath: string | null
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ReindexParams {

}

namespace ReindexRequest {
	export const type: RequestType<ReindexParams, null, any> = new RequestType('antlers/reindex');
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ManifestAvailableParams {

}

namespace ManifestAvailableRequest {
	export const type: RequestType<ReindexParams, null, any> = new RequestType('antlers/loadManifest');
}

namespace ReloadAddonRequest {
	export const type: RequestType<ReloadAddonParams, null, any> = new RequestType('antlers/reloadAddons');
}

const EmptyAddonParms: ReloadAddonParams = {
	extensionPath: null
};

namespace SemanticTokenRequest {
	export const type: RequestType<SemanticTokenParams, number[] | null, any> = new RequestType('antlers/semanticTokens');
}

namespace SemanticTokenLegendRequest {
	export const type: RequestType0<{ types: string[]; modifiers: string[] } | null, any> = new RequestType0('antlers/semanticTokenLegend');
}

let client: LanguageClient;
let phpWatcher: FileSystemWatcher | null = null,
	composerWatcher: FileSystemWatcher | null = null,
	manifestWatcher: FileSystemWatcher | null = null;

let isClientReady = false;

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
const debouncedManifestLoaded = debounce(sendManifestReloadRequest, 350);

export function activate(context: ExtensionContext) {
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
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'antlersLanguageServer',
		'Antlers Language Server',
		serverOptions,
		clientOptions
	);

	const toDispose = context.subscriptions,
		documentSelector = ['html', 'antlers'];
	let addonQueue: ReloadAddonParams[] = [];
	const reloadAddonsCommand = 'vscodeAntlers.reloadAddons';
	const reloadAddonHandler = (path: string | null = null) => {
		const params: ReloadAddonParams = {
			extensionPath: path
		};

		if (client != null) {
			if (client.needsStart() || isClientReady == false) {
				addonQueue.push(params);
			} else {
				client.sendRequest(ReloadAddonRequest.type, params);
			}
		}
	};

	const clDisposable = languages.registerCodeLensProvider(
		documentSelector,
		new TimingsLensProvider()
	);

	toDispose.push(clDisposable);

	context.subscriptions.push(commands.registerCommand(reloadAddonsCommand, reloadAddonHandler));

	workspace.onDidChangeTextDocument(_e => {
		resetTimings();
	});

	phpWatcher = workspace.createFileSystemWatcher('**/*.php');
	composerWatcher = workspace.createFileSystemWatcher('**/composer.lock');
	manifestWatcher = workspace.createFileSystemWatcher('**/.antlers.json');

	manifestWatcher.onDidDelete(() => {
		debouncedManifestLoaded();
	});

	manifestWatcher.onDidCreate(() => {
		debouncedManifestLoaded();
	});

	manifestWatcher.onDidChange(() => {
		debouncedManifestLoaded();
	});

	composerWatcher.onDidChange(() => {
		debouncedAskForIndex();
	});

	composerWatcher.onDidCreate(() => {
		debouncedAskForIndex();
	});

	composerWatcher.onDidDelete(() => {
		debouncedAskForIndex();
	});

	phpWatcher.onDidChange(() => {
		debouncedAskForIndex();
	});
	phpWatcher.onDidCreate(() => {
		debouncedAskForIndex();

	});
	phpWatcher.onDidDelete(() => {
		debouncedAskForIndex();
	});

	activateAntlersDebug(context);

	// Start the client. This will also launch the server
	const disposable = client.start();
	toDispose.push(disposable);
	client.onReady().then(() => {
		isClientReady = true;


		if (addonQueue.length > 0) {
			for (let i = 0; i < addonQueue.length; i++) {
				client.sendRequest(ReloadAddonRequest.type, addonQueue[i]);
			}
			addonQueue = [];
		}

		sendManifestReloadRequest();

		extensions.onDidChange(() => {
			client.sendRequest(ReloadAddonRequest.type, EmptyAddonParms);
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
	});
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}

	phpWatcher?.dispose();
	composerWatcher?.dispose();
	manifestWatcher?.dispose();

	return client.stop();
}
