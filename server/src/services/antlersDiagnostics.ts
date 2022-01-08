import { Diagnostic, _Connection } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import DiagnosticsManager from '../diagnostics/diagnosticsManager';
import { documentMap, sessionDocuments } from '../languageService/documents';
import ProjectManager from '../projects/projectManager';
import { anltersErrorsToDiagnostics } from "../utils/conversions";

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

    const problems = 0;
    const diagnostics: Diagnostic[] = [];

    if (sessionDocuments.hasDocument(docPath)) {
        const doc = sessionDocuments.getDocument(docPath);
        const errors = doc.errors.all();

        anltersErrorsToDiagnostics(doc.errors.all()).forEach((error) => {
            diagnostics.push(error);
        });

        if (DiagnosticsManager.instance?.hasDiagnosticsIssues(docPath)) {
            anltersErrorsToDiagnostics(DiagnosticsManager.instance.getDiagnostics(docPath)).forEach((error) => {
                diagnostics.push(error);
            });
        }
    }

    // Send the computed diagnostics to VSCode.
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    sendOtherDiagnostics(textDocument.uri, connection);
}

function sendOtherDiagnostics(currentUri: string, connection: _Connection) {

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
