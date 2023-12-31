import { AntlersDocument } from '../runtime/document/antlersDocument.js';
import { AntlersError } from '../runtime/errors/antlersError.js';
import { AntlersNode } from '../runtime/nodes/abstractNode.js';
import { getAntlersSettings } from '../server.js';
import { IDiagnosticsHandler } from "./diagnosticsHandler.js";
import { IDocumentDiagnosticsHandler } from './documentHandler.js';
import { CoreDocumentHandlers } from './documentHandlers/coreDocHandlers.js';
import CoreHandlers from "./handlers/coreHandlers.js";

class DiagnosticsManager {
    private fileDiagnostics: Map<string, AntlersError[]> = new Map();
    private handlers: IDiagnosticsHandler[] = [];
    private docHandlers: IDocumentDiagnosticsHandler[] = [];

    public static instance: DiagnosticsManager | null = null;

    registerHandler(handler: IDiagnosticsHandler) {
        this.handlers.push(handler);
    }

    registerDocumentHandler(handler: IDocumentDiagnosticsHandler) {
        this.docHandlers.push(handler);
    }

    registerDocumentHandlers(handlers: IDocumentDiagnosticsHandler[]) {
        for (let i = 0; i < handlers.length; i++) {
            this.registerDocumentHandler(handlers[i]);
        }
    }

    registerHandlers(handlers: IDiagnosticsHandler[]) {
        for (let i = 0; i < handlers.length; i++) {
            this.registerHandler(handlers[i]);
        }
    }

    registerCoreHandlers() {
        this.registerHandlers(CoreHandlers);
        this.registerDocumentHandlers(CoreDocumentHandlers);
    }

    hasDiagnosticsIssues(documentUri: string): boolean {
        if (this.fileDiagnostics.has(documentUri) == false) {
            return false;
        }

        const docIssues = this.fileDiagnostics.get(
            documentUri
        ) as AntlersError[];

        return docIssues.length > 0;
    }

    registerDiagnostics(documentUri: string, issues: AntlersError[]) {
        this.fileDiagnostics.set(documentUri, issues);
    }

    clearIssues(documentUri: string) {
        this.fileDiagnostics.set(documentUri, []);
    }

    getDiagnostics(documentUri: string): AntlersError[] {
        if (this.hasDiagnosticsIssues(documentUri)) {
            return this.fileDiagnostics.get(documentUri) as AntlersError[];
        }

        return [];
    }

    checkDocument(document: AntlersDocument) {
        const errors: AntlersError[] = [],
            settings = getAntlersSettings();

        this.docHandlers.forEach((handler) => {
            handler.checkDocument(document, settings).forEach((error) => {
                errors.push(error);
            });
        });
        return errors;
    }

    checkNode(node: AntlersNode) {
        const errors: AntlersError[] = [];

        if (node.isComment) { return errors; }

        const currentSettings = getAntlersSettings();

        this.handlers.forEach((handler) => {
            handler.checkNode(node, currentSettings).forEach((error) => {
                errors.push(error);
            });
        });
        return errors;
    }

    getAllDiagnostics(): AntlersError[] {
        const allErrors: AntlersError[] = [];

        this.fileDiagnostics.forEach((value: AntlersError[], key: string) => {
            for (let i = 0; i < value.length; i++) {
                allErrors.push(value[i]);
            }
        });

        return allErrors;
    }
}

if (typeof DiagnosticsManager.instance == "undefined" || DiagnosticsManager.instance == null) {
    DiagnosticsManager.instance = new DiagnosticsManager();
    DiagnosticsManager.instance.registerCoreHandlers();
}

export default DiagnosticsManager;
