/* eslint-disable @typescript-eslint/no-namespace */
import {
	Range,
	TextDocument
} from 'vscode-languageserver-textdocument';
import {
	createConnection,
	DidChangeConfigurationNotification, DidChangeWatchedFilesNotification, HoverParams, InitializeParams,
	InitializeResult, ProposedFeatures, RequestType, RequestType0, TextDocumentIdentifier, TextDocuments,
	TextDocumentSyncKind
} from 'vscode-languageserver/node';
import { ModifierManager } from './antlers/modifierManager';
import { PermissionsManager } from './antlers/permissions/permissionManager';
import { TagManager } from './antlers/tagManager';
import { handleOnCompletion, handleOnCompletionResolve } from './services/antlersCompletion';
import { handleFoldingRequest } from './services/antlersFoldingRegions';
import { parseDocument, validateTextDocument } from './services/antlersDiagnostics';
import { analyzeStructures, collectProjectDetails, documentMap, parserInstances } from './session';
import { DiagnosticsManager } from './diagnostics/diagnosticsManager';
import { FieldtypeManager } from './antlers/fieldtypes/fieldtypeManager';
import { formatAntlersDocument } from './formatting/formatter';
import { SnippetsManager } from './suggestions/snippets/snippetsManager';
import { handleSignatureHelpRequest } from './services/modifierMethodSignatures';
import { handleDocumentHover } from './services/antlersHover';
import { handleDefinitionRequest } from './services/antlersDefinitions';
import { newSemanticTokenProvider } from './services/semanticTokens';
import { ExtensionManager } from './extensibility/extensionManager';
import { checkForIndexProcessAvailability, reloadProjectManifest, safeRunIndexing } from './projects/manifest';

// The example settings
export interface ExampleSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

let htmlFormatterSettings:any = null;

export {htmlFormatterSettings};

export { defaultSettings, globalSettings, documentSettings };
export { hasConfigurationCapability, connection };


// Load the core Statamic Antlers tags.
SnippetsManager.loadCoreSnippets();
FieldtypeManager.loadCoreFieldtypes();
TagManager.loadCoreTags();
ModifierManager.loadCoreModifiers();
PermissionsManager.loadCorePermissions();
DiagnosticsManager.registerCoreHandlers();

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
const serverDirectory = __dirname;

export { serverDirectory };

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ManifestAvailableParams {

}

namespace ManifestAvailableRequest {
	export const type: RequestType<ReindexParams, null, any> = new RequestType('antlers/loadManifest');
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ReindexParams { }

namespace ReindexRequest {
	export const type: RequestType<ReindexParams, null, any> = new RequestType('antlers/reindex');
}

namespace SemanticTokenLegendRequest {
	export const type: RequestType0<{ types: string[]; modifiers: string[] } | null, any> = new RequestType0('antlers/semanticTokenLegend');
}

interface SemanticTokenParams {
	textDocument: TextDocumentIdentifier;
	ranges?: Range[];
}
namespace SemanticTokenRequest {
	export const type: RequestType<SemanticTokenParams, number[] | null, any> = new RequestType('antlers/semanticTokens');
}

interface ReloadAddonParams {
	extensionPath: string | null
}

namespace ReloadAddonRequest {
	export const type: RequestType<ReloadAddonParams, null, any> = new RequestType('antlers/reloadAddons');
}

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;

	checkForIndexProcessAvailability();

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Full,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true,
				triggerCharacters: [':', '"', "'", '{', '/', '|']
			},
			documentFormattingProvider: {},
			foldingRangeProvider: {},
			signatureHelpProvider: {
				triggerCharacters: [':'],
			},
			hoverProvider: {

			},
			definitionProvider: {

			},
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}

	const htmlResult = connection.workspace.getConfiguration('html').then(function (value) {
		htmlFormatterSettings = value;
	});
});

export function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'antlers'
		});
		
		documentSettings.set(resource, result);
	}
	return result;
}

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(
			(change.settings.languageServerExample || defaultSettings)
		);
	}

	const htmlResult = connection.workspace.getConfiguration('html').then(function (value) {
		htmlFormatterSettings = value;
	});

	// Revalidate all open text documents
	documents.all().forEach(collectProjectDetails);
	documents.all().forEach(parseDocument);
	documents.all().forEach((document: TextDocument) => {
		analyzeStructures(encodeURIComponent(document.uri));
	});
	documents.all().forEach(validateTextDocument);
});

/*connection.onDocumentLinks((params:DocumentLinkParams) => {
	let docPath = decodeURIComponent(params.textDocument.uri);

	return DocumentLinkManager.getDocumentLinks(docPath);
});*/

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(decodeURIComponent(e.document.uri));
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	collectProjectDetails(change.document);
	parseDocument(change.document);
	analyzeStructures(decodeURIComponent(change.document.uri));
	validateTextDocument(change.document);
});

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
});

connection.onHover((_params) => {
	return handleDocumentHover(_params);
});

connection.onDefinition(handleDefinitionRequest);
connection.onFoldingRanges(handleFoldingRequest);
connection.onSignatureHelp(handleSignatureHelpRequest);
connection.onDocumentFormatting(formatAntlersDocument);
connection.onCompletion(handleOnCompletion);
connection.onCompletionResolve(handleOnCompletionResolve);

documents.listen(connection);

connection.onRequest(SemanticTokenLegendRequest.type, token => {
	return newSemanticTokenProvider().legend;
});

connection.onRequest(ReloadAddonRequest.type, (params, token) => {
	if (params.extensionPath != null) {
		ExtensionManager.loadAddons(params.extensionPath);
		ExtensionManager.bootAddons();
	}
});

connection.onRequest(ReindexRequest.type, () => {
	safeRunIndexing();
});

connection.onRequest(ManifestAvailableRequest.type, () => {
	reloadProjectManifest();
});

connection.onRequest(SemanticTokenRequest.type, (params, token) => {
	const docPath = decodeURIComponent(params.textDocument.uri);

	if (documentMap.has(docPath)) {
		const document = documentMap.get(docPath) as TextDocument;

		return newSemanticTokenProvider().getSemanticTokens(document, params.ranges);
	}

	return null;
});

// Listen on the connection
connection.listen();
