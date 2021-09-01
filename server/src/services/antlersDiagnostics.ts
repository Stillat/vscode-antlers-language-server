import { Diagnostic } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { AntlersParser } from '../antlers/parser';
import { DiagnosticsManager } from '../diagnostics/diagnosticsManager';
import { MockProject } from '../projects/statamicProject';
import { connection, getDocumentSettings } from '../server';
import { currentStructure, documentMap, parserInstances } from '../session';

export function parseDocument(textDocument: TextDocument) {

	const documentPath = decodeURIComponent(textDocument.uri);
	const text = textDocument.getText();

	if (parserInstances.has(documentPath) == false) {
		parserInstances.set(documentPath, new AntlersParser());
	}
	documentMap.set(documentPath, textDocument);

	const parser = parserInstances.get(documentPath) as AntlersParser;

	let structureToUse = MockProject;

	if (currentStructure != null) {
		structureToUse = currentStructure;
	}

	parser.parseText(documentPath, text, structureToUse);
}

export async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	const documentPath = decodeURIComponent(textDocument.uri);
	const settings = await getDocumentSettings(documentPath);
	const text = textDocument.getText();

	if (parserInstances.has(documentPath) == false) {
		parserInstances.set(documentPath, new AntlersParser());
	}

	documentMap.set(documentPath, textDocument);

	const parser = parserInstances.get(documentPath) as AntlersParser;

	let structureToUse = MockProject;

	if (currentStructure != null) {
		structureToUse = currentStructure;
	}

	let issues = parser.getAntlersErrors();

	let problems = 0;
	const diagnostics: Diagnostic[] = [];

	issues = issues.concat(DiagnosticsManager.getDiagnostics(documentPath));

	for (let i = 0; i < issues.length; i++) {
		const foundError = issues[i];

		const diagnostic: Diagnostic = {
			severity: foundError.severity,
			range: {
				start: {
					line: foundError.startLine,
					character: foundError.startPos
				},
				end: {
					line: foundError.endLine,
					character: foundError.endPos
				}
			},
			message: foundError.message,
			source: 'antlers'
		};

		if (diagnostic.range.start.character > 0 && diagnostic.range.end.character > 0) {
			diagnostics.push(diagnostic);
			problems++;
		}

		if (settings !== null && problems == settings.maxNumberOfProblems) {
			break;
		}
	}

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
	sendOtherDiagnostics(textDocument.uri);
}

function sendOtherDiagnostics(currentUri: string) {
	if (currentStructure != null) {
		for (let i = 0; i < currentStructure.views.length; i++) {
			if (currentStructure.views[i].documentUri != currentUri) {
				if (DiagnosticsManager.hasDiagnosticsIssues(currentStructure.views[i].documentUri)) {
					const diagnostics: Diagnostic[] = [],
						issues = DiagnosticsManager.getDiagnostics(currentStructure.views[i].documentUri);

					for (let j = 0; j < issues.length; j++) {
						const foundError = issues[j];

						diagnostics.push({
							severity: foundError.severity,
							range: {
								start: {
									line: foundError.startLine,
									character: foundError.startPos
								},
								end: {
									line: foundError.endLine,
									character: foundError.endPos
								}
							},
							message: foundError.message,
							source: 'antlers'
						});
					}

					connection.sendDiagnostics({
						uri: currentStructure.views[i].originalDocumentUri,
						diagnostics: diagnostics
					});
				}
			}
		}
	}
}
