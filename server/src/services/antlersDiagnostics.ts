import { CodeAction, Diagnostic, _Connection } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import DiagnosticsManager from '../diagnostics/diagnosticsManager.js';
import { documentMap, sessionDocuments } from '../languageService/documents.js';
import ProjectManager from '../projects/projectManager.js';
import { getAntlersSettings } from '../server.js';
import { anltersErrorsToDiagnostics } from "../utils/conversions.js";
import { setCurDiagnostics } from './antlersRefactoring.js';

export function parseDocumentText(uri: string, text: string) {
    const documentPath = decodeURIComponent(uri);
    sessionDocuments.createOrUpdate(
        documentPath,
        text
    );
}

export function parseDocument(textDocument: TextDocument) {
    const documentPath = decodeURIComponent(textDocument.uri);

    sessionDocuments.createOrUpdate(
        decodeURIComponent(textDocument.uri),
        textDocument.getText()
    );

    documentMap.set(documentPath, textDocument);
}

export async function validateTextDocument(textDocument: TextDocument, connection: _Connection): Promise<void> {
    const docPath = decodeURIComponent(textDocument.uri);
    sessionDocuments.createOrUpdate(docPath, textDocument.getText());

    const diagnostics: Diagnostic[] = [];

    if (sessionDocuments.hasDocument(docPath)) {
        const doc = sessionDocuments.getDocument(docPath);

        anltersErrorsToDiagnostics(doc.errors.all()).forEach((error) => {
            diagnostics.push(error);
        });

        if (DiagnosticsManager.instance?.hasDiagnosticsIssues(docPath)) {
            const antlersErrors = DiagnosticsManager.instance.getDiagnostics(docPath);

            anltersErrorsToDiagnostics(antlersErrors).forEach((error) => {
                diagnostics.push(error);
            });
        }
    }

    const settings = getAntlersSettings();

    if (settings.diagnostics.reportDiagnostics == false) {
        return;
    }

    setCurDiagnostics(diagnostics);
    // Send the computed diagnostics to VSCode.
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    sendOtherDiagnostics(textDocument.uri, connection);
}

export function sendAllDiagnostics(connection: _Connection) {
    if (ProjectManager.instance?.hasStructure()) {
        const projViews = ProjectManager.instance.getStructure().getViews();

        for (let i = 0; i < projViews.length; i++) {
            const diagnosticsPath = decodeURIComponent(projViews[i].documentUri);
            let diagnostics: Diagnostic[] = [];

            if (sessionDocuments.hasDocument(diagnosticsPath)) {
                const doc = sessionDocuments.getDocument(diagnosticsPath);

                doc.reloadDocument();

                anltersErrorsToDiagnostics(doc.errors.all()).forEach((error) => {
                    diagnostics.push(error);
                });

                anltersErrorsToDiagnostics(DiagnosticsManager.instance?.checkDocument(doc) ?? []).forEach((error) => {
                    diagnostics.push(error);
                });

                doc.getAllAntlersNodes().forEach((node) => {
                    const nodeErrors = DiagnosticsManager.instance?.checkNode(node) ?? [];

                    if (nodeErrors.length > 0) {
                        anltersErrorsToDiagnostics(nodeErrors).forEach((nError) => {
                            diagnostics.push(nError);
                        });
                    }
                });
            }

            connection.sendDiagnostics({
                uri: projViews[i].originalDocumentUri,
                diagnostics: diagnostics,
            });
        }
    }
}

function sendOtherDiagnostics(currentUri: string, connection: _Connection) {
    const settings = getAntlersSettings();

    if (settings.diagnostics.reportDiagnostics == false) {
        return;
    }

    if (ProjectManager.instance?.hasStructure()) {
        const projViews = ProjectManager.instance.getStructure().getViews();

        for (let i = 0; i < projViews.length; i++) {
            if (projViews[i].documentUri != currentUri) {
                const diagnosticsPath = decodeURIComponent(projViews[i].documentUri);
                if (DiagnosticsManager.instance?.hasDiagnosticsIssues(diagnosticsPath)) {
                    const diagnostics: Diagnostic[] = [],
                        issues = DiagnosticsManager.instance?.getDiagnostics(diagnosticsPath);

                    anltersErrorsToDiagnostics(issues).forEach((error) => {
                        diagnostics.push(error);
                    });

                    connection.sendDiagnostics({
                        uri: projViews[i].originalDocumentUri,
                        diagnostics: diagnostics,
                    });
                }
            }
        }
    }
}
