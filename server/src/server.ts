#!/usr/bin/env node

import uri2path from 'file-uri-to-path';
import * as fs from 'fs';

/* eslint-disable @typescript-eslint/no-namespace */
import { Range, TextDocument } from "vscode-languageserver-textdocument";
import {
    ApplyWorkspaceEditParams,
    createConnection,
    DidChangeConfigurationNotification,
    DocumentLinkParams,
    InitializeParams,
    InitializeResult,
    ProposedFeatures,
    RequestType,
    RequestType0,
    TextDocumentChangeEvent,
    TextDocumentIdentifier,
    TextDocuments,
    TextDocumentSyncKind,
    WorkspaceEdit,
} from "vscode-languageserver/node.js";
import {
    handleOnCompletion,
    handleOnCompletionResolve,
} from "./services/antlersCompletion.js";
import { handleFoldingRequest } from "./services/antlersFoldingRegions.js";
import {
    parseDocument,
    parseDocumentText,
    sendAllDiagnostics,
    validateTextDocument,
} from "./services/antlersDiagnostics.js";
import { formatAntlersDocument } from "./formatting/formatter.js";
import { handleSignatureHelpRequest } from "./services/modifierMethodSignatures.js";
import { handleDocumentHover } from "./services/antlersHover.js";
import { handleDefinitionRequest } from "./services/antlersDefinitions.js";
import { newSemanticTokenProvider } from "./services/semanticTokens.js";
import { handleDocumentSymbolRequest } from "./services/documentSymbols.js";
import { DocumentLinkManager } from "./services/antlersLinks.js";
import ProjectManager from './projects/projectManager.js';
import InjectionManager from './antlers/scope/injections.js';
import { sessionDocuments, documentMap } from './languageService/documents.js';
import { getProjectStructure } from './projects/fileSystemProvider/fileSystemStatamicProject.js';
import TagManager from './antlers/tagManagerInstance.js';
import { YieldContext } from './antlers/tags/core/sections/yield.js';
import { UnclosedTagManager } from './antlers/unclosedTagManager.js';
import DiagnosticsManager from './diagnostics/diagnosticsManager.js';
import ReferenceManager from './references/referenceManager.js';
import SectionManager from './references/sectionManager.js';
import SessionVariableManager from './references/sessionVariableManager.js';
import { AntlersError } from './runtime/errors/antlersError.js';
import { htmlFormatterSettings, updateHtmlFormatterSettings } from './languageService/htmlFormatterSettings.js';
import { AntlersNode } from './runtime/nodes/abstractNode.js';
import { SessionVariableContext } from './antlers/tags/core/contexts/sessionContext.js';
import { handleReferences } from './services/antlersVariableReferences.js';
import { handleDocumentHighlight } from './services/antlersDocumentHighlight.js';
import DocumentTransformer from './runtime/parser/documentTransformer.js';
import { IHTMLFormatConfiguration } from './formatting/htmlCompat.js';
import { AntlersDocument } from './runtime/document/antlersDocument.js';
import { handleCodeActions } from './services/antlersRefactoring.js';
import ExtractPartialHandler from './refactoring/core/extractPartialHandler.js';
import { BeautifyDocumentFormatter } from './formatting/beautifyDocumentFormatter.js';
import { AntlersSettings } from './antlersSettings.js';
import { debounce } from 'ts-debounce';
import { DocumentationHandler } from './documentation/generator/handler.js';
import { IProjectFields } from './projects/structuredFieldTypes/types.js';
import { IDocumentationResult } from './documentation/generator/types.js';
import { updateCurrentDetails } from './documentation/generator/documentationProvider.js';

const defaultSettings: AntlersSettings = {
    formatFrontMatter: false,
    showGeneralSnippetCompletions: true,
    diagnostics: {
        warnOnDynamicCssClassNames: true,
        validateTagParameters: true,
        reportDiagnostics: true
    },
    trace: { server: 'off' },
    formatterIgnoreExtensions: ['xml'],
    languageVersion: 'runtime'
};

let globalSettings: AntlersSettings = defaultSettings;

function updateGlobalSettings(settings: AntlersSettings) {
    globalSettings = settings;
}

export function getAntlersSettings() {
    return globalSettings;
}

export { globalSettings };

const connection = createConnection(ProposedFeatures.all);

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LockEditsParams { }
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ProjectUpdateParams { }

interface ForcedFormatParams {
    content: string,
    tabSize: number,
    insertSpaces: boolean
}

interface DocumentTransformParams {
    content: string
}

interface ProjectDetailsParams {
    content: IProjectFields
}

interface TransformReplacement {
    find: string,
    replace: string
}

interface DocumentTransformResult {
    shouldParse: boolean,
    transformedText: string,
    replacements: TransformReplacement[]
}

export interface GenerateHelpParams {
    context: any
}

export interface GenerateHelpResult {
    result: IDocumentationResult,
    didGenerate: boolean
}

namespace GenerateHelpRequest {
    export const type: RequestType<GenerateHelpParams, GenerateHelpResult, any> = new RequestType('antlers/generateHelp');
}

namespace LockEditsRequest {
    export const type: RequestType<LockEditsParams, null, any> = new RequestType("antlers/lockedits");
}

namespace ForcedFormatRequest {
    export const type: RequestType<ForcedFormatParams, string, any> = new RequestType('antlers/forcedFormat');
}

namespace ProjectUpdateRequest {
    export const type: RequestType<ProjectUpdateParams, null, any> = new RequestType('antlers/projectUpdate');
}

namespace DocumentTransformRequest {
    export const type: RequestType<DocumentTransformParams, DocumentTransformResult, any> = new RequestType('antlers/transform');
}

namespace SemanticTokenLegendRequest {
    export const type: RequestType0<
        { types: string[]; modifiers: string[] } | null,
        any
    > = new RequestType0("antlers/semanticTokenLegend");
}

interface SemanticTokenParams {
    textDocument: TextDocumentIdentifier;
    ranges?: Range[];
}

namespace SemanticTokenRequest {
    export const type: RequestType<SemanticTokenParams, number[] | null, any> =
        new RequestType("antlers/semanticTokens");
}

connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;

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
                triggerCharacters: [":", '"', "'", "{", "/", "|", "@", ' '],
            },
            documentFormattingProvider: {},
            foldingRangeProvider: {},
            signatureHelpProvider: {
                triggerCharacters: [','],
            },
            documentLinkProvider: {},
            hoverProvider: {},
            definitionProvider: {},
            documentSymbolProvider: {},
            referencesProvider: {},
            documentHighlightProvider: {},
            codeActionProvider: {},
            executeCommandProvider: {
                commands: ['antlers.extractToPartial']
            }
        },
    };
    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true,
            },
        };
    }
    return result;
});

connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(
            DidChangeConfigurationNotification.type,
            undefined
        );
    }

    connection.workspace
        .getConfiguration("html")
        .then(function (value) {
            updateHtmlFormatterSettings(value);
        });

    connection.workspace
        .getConfiguration("antlersLanguageServer")
        .then(function (value) {
            if (value != null) {
                updateGlobalSettings(value as AntlersSettings);
            } else {
                updateGlobalSettings(defaultSettings);
            }
        });
});

connection.onExecuteCommand(async (params) => {
    if (params.command == 'antlers.extractToPartial' && ExtractPartialHandler.currentAction != null) {
        if (params.arguments?.length == 3) {
            ExtractPartialHandler.currentAction.completeRefactor({
                path: params.arguments[1],
                fsPath: params.arguments[2]
            });
        }
    }
    return;
});

connection.onDidChangeConfiguration((change) => {
    connection.workspace
        .getConfiguration("html")
        .then(function (value) {
            updateHtmlFormatterSettings(value);
        });
    connection.workspace
        .getConfiguration("antlersLanguageServer")
        .then(function (value) {
            if (value != null) {
                const curSettings = getAntlersSettings();
                const newSettings = value as AntlersSettings;
                updateGlobalSettings(newSettings);

                if (newSettings.diagnostics.reportDiagnostics == false) {
                    if (ProjectManager.instance?.hasStructure()) {
                        const projViews = ProjectManager.instance.getStructure().getViews();

                        for (let i = 0; i < projViews.length; i++) {
                            connection.sendDiagnostics({
                                uri: projViews[i].originalDocumentUri,
                                diagnostics: [],
                            });
                        }
                    }
                }

                if (curSettings.languageVersion != newSettings.languageVersion) {
                    sendAllDiagnostics(connection);
                }
            } else {
                updateGlobalSettings(defaultSettings);
            }
        });

    documents.all().forEach(collectProjectDetails);
    documents.all().forEach(parseDocument);
    documents.all().forEach((document: TextDocument) => {
        analyzeStructures(encodeURIComponent(document.uri));
    });
    documents.all().forEach((document) => {
        validateTextDocument(document, connection);
    });
});

connection.onDocumentLinks((params: DocumentLinkParams) => {
    const docPath = decodeURIComponent(params.textDocument.uri);

    return DocumentLinkManager.getDocumentLinks(docPath);
});

let isDidChangeContentLocked = false;

connection.onRequest(LockEditsRequest.type, () => {
    isDidChangeContentLocked = true;
});

function contentChangeHandler(change: TextDocumentChangeEvent<TextDocument>) {
    if (isDidChangeContentLocked) {
        isDidChangeContentLocked = false;
        return;
    }

    collectProjectDetails(change.document);
    parseDocument(change.document);
    analyzeStructures(decodeURIComponent(change.document.uri));
    validateTextDocument(change.document, connection);
}

const debouncedCompletionHandler = debounce(handleOnCompletion, 97);

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(contentChangeHandler);

connection.onDidChangeWatchedFiles((_change) => {
    // Monitored files have change in VSCode
});

connection.onHover((_params) => {
    return handleDocumentHover(_params);
});

connection.onDocumentSymbol((_params) => {
    return handleDocumentSymbolRequest(_params);
});

connection.onDocumentHighlight(handleDocumentHighlight);
connection.onReferences(handleReferences);

connection.onDefinition(handleDefinitionRequest);
connection.onFoldingRanges(handleFoldingRequest);
connection.onSignatureHelp(handleSignatureHelpRequest);
connection.onDocumentFormatting(formatAntlersDocument);
connection.onCompletion(debouncedCompletionHandler);
connection.onCompletionResolve(handleOnCompletionResolve);
documents.listen(connection);

connection.onRequest(SemanticTokenLegendRequest.type, (token) => {
    return newSemanticTokenProvider().legend;
});

connection.onRequest(ForcedFormatRequest.type, (params) => {
    const settings = getAntlersSettings(),
        options = htmlFormatterSettings.format as IHTMLFormatConfiguration;

    const formatter = new BeautifyDocumentFormatter({
        tabSize: params.tabSize,
        formatFrontMatter: settings.formatFrontMatter,
        insertSpaces: params.insertSpaces,
        formatExtensions: [],
        maxStatementsPerLine: 3,
        htmlOptions: options
    });

    return formatter.formatDocument(AntlersDocument.fromText(params.content), getAntlersSettings());
});

connection.onRequest(GenerateHelpRequest.type, (params) => {
    return {
        didGenerate: true,
        result: DocumentationHandler.handle(params)
    } as GenerateHelpResult;
});

connection.onRequest(DocumentTransformRequest.type, (params) => {
    const transformer = new DocumentTransformer();
    transformer.load(params.content);

    const transformReplacements: TransformReplacement[] = [];

    transformer.getMapping().forEach((value, replacement) => {
        transformReplacements.push({
            find: replacement,
            replace: value
        });
    });

    const response: DocumentTransformResult = {
        shouldParse: transformer.getShouldFormat(),
        transformedText: transformer.getBuffer(),
        replacements: transformReplacements
    };

    return response;
});

connection.onCodeAction(handleCodeActions);

connection.onRequest(ProjectUpdateRequest.type, () => {
    ProjectManager.instance?.setDirtyState(true);
    ProjectManager.instance?.reloadDetails();

    if (ProjectManager.instance?.hasStructure()) {
        const currentStructure = ProjectManager.instance?.getStructure();

        sessionDocuments.setProject(currentStructure);
        InjectionManager.instance?.updateProject(currentStructure);
    }
});

connection.onRequest(SemanticTokenRequest.type, (params, token) => {
    const docPath = decodeURIComponent(params.textDocument.uri);

    if (documentMap.has(docPath)) {
        const document = documentMap.get(docPath) as TextDocument;

        return newSemanticTokenProvider().getSemanticTokens(document, params.ranges);
    }

    return null;
});

/**
 * Attempts to retrieve details about the current Statamic project.
 * @param textDocument 
 */
async function collectProjectDetails(textDocument: TextDocument): Promise<void> {
    if (ProjectManager.instance?.hasStructure()) {
        ProjectManager.instance.reloadDetails();

        sessionDocuments.setProject(ProjectManager.instance.getStructure());
        return;
    }

    const docPath = decodeURIComponent(textDocument.uri), localPath = uri2path(docPath),
        project = getProjectStructure(localPath);
    ProjectManager.instance?.setActiveProject(project);

    if (ProjectManager.instance?.hasStructure()) {
        sessionDocuments.setProject(ProjectManager.instance?.getStructure());
        InjectionManager.instance?.updateProject(ProjectManager.instance?.getStructure());
    }

    ReferenceManager.instance?.clearPartialReferences(docPath);
    DiagnosticsManager.instance?.clearIssues(docPath);

    if (ProjectManager.instance?.hasStructure()) {
        const curViews = ProjectManager.instance.getStructure().getViews();
        for (let i = 0; i < curViews.length; i++) {
            const thisView = curViews[i];

            parseDocumentText(
                thisView.documentUri,
                fs.readFileSync(thisView.path, { encoding: 'utf8' })
            );

            analyzeStructures(thisView.documentUri);
        }
    }
}

export function requestEdits(edit: WorkspaceEdit) {
    const params: ApplyWorkspaceEditParams = {
        edit: edit
    };

    connection.sendRequest("workspace/applyEdit", params);
}

export function sendProjectDetails(contents: IProjectFields) {
    ProjectManager.instance?.setStructuredProject(contents);
    updateCurrentDetails(contents);
    const params: ProjectDetailsParams = {
        content: contents
    };

    connection.sendRequest("antlers/projectDetailsAvailable", params);
}

function analyzeStructures(document: string) {
    document = decodeURIComponent(document);
    if (sessionDocuments.hasDocument(document)) {
        const doc = sessionDocuments.getDocument(document),
            nodes = doc.getAllAntlersNodes();

        DiagnosticsManager.instance?.clearIssues(document);
        ReferenceManager.instance?.clearAllReferences(document);
        UnclosedTagManager.clear(document);

        const fileSections: YieldContext[] = [],
            fileSessionVariables: SessionVariableContext[] = [],
            partialTags: AntlersNode[] = [],
            cacheTags: AntlersNode[] = [],
            unclosedTags: AntlersNode[] = [];
        let documentErrors: AntlersError[] = [];

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i],
                tagName = node.getTagName();

            if (tagName === "yield" || tagName == "yields") {
                const thisRef = node.reference;

                if (thisRef != null && thisRef instanceof YieldContext) {
                    fileSections.push(thisRef);
                }
            } else if (tagName === "partial") {
                partialTags.push(node);
            } else if (tagName === "cache") {
                cacheTags.push(node);
            } else if (node.runtimeName() == "session:set" || node.runtimeName() == "session:flash") {
                const thisRef = node.reference;

                if (thisRef != null && thisRef instanceof SessionVariableContext) {
                    fileSessionVariables.push(thisRef);
                }
            }

            if (node.modifiers != null) {
                const partialModifierValue = node.modifiers.getModifierValue('partial');

                if (partialModifierValue != null) {
                    const partialRef = ProjectManager.instance?.getStructure().findPartial(partialModifierValue);

                    if (partialRef != null) {

                        ReferenceManager.instance?.clearRemovesPageScope(partialRef.originalDocumentUri);
                        ReferenceManager.instance?.setRemovesPageScope(partialRef.originalDocumentUri, node);
                    }
                }
            }

            if (node.isTagNode) {
                const tagRef = TagManager.instance?.findTag(node.runtimeName());

                if (tagRef != null && tagRef.requiresClose) {
                    if (node.isClosedBy == null && node.isClosingTag == false && node.isSelfClosing == false) {
                        unclosedTags.push(node);
                    }
                }
            } else if (node.manifestType === "array" && node.isClosedBy == null) {
                unclosedTags.push(node);
            }

            const errors = DiagnosticsManager.instance?.checkNode(node) ?? [];

            if (errors.length > 0) {
                documentErrors = documentErrors.concat(errors);
            }
        }

        const docLevelErrors = DiagnosticsManager.instance?.checkDocument(doc) ?? [];

        if (docLevelErrors.length > 0) {
            documentErrors = documentErrors.concat(docLevelErrors);
        }

        if (unclosedTags.length > 0) {
            UnclosedTagManager.registerNodes(document, unclosedTags);
        }

        InjectionManager.instance?.registerInjections(document, partialTags);
        SectionManager.instance?.registerDocumentSections(document, fileSections);
        ReferenceManager.instance?.registerPartialReferences(document, partialTags);
        ReferenceManager.instance?.registerCacheReferences(document, cacheTags);
        DiagnosticsManager.instance?.registerDiagnostics(document, documentErrors);
        SessionVariableManager.instance?.registerDocumentSessionVariables(
            document,
            fileSessionVariables
        );
    }
}

// Listen on the connection
connection.listen();
