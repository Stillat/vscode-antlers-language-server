import * as fs from 'fs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const uri2path = require('file-uri-to-path');

import { WorkDoneProgress, WorkDoneProgressCreateRequest } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getModifier } from './antlers/modifierFetcher';
import { AntlersParser } from './antlers/parser';
import { InjectionManager } from './antlers/scope/injections';
import { TagManager } from './antlers/tagManager';
import { YieldContext } from './antlers/tags/core/sections/yield';
import { SessionVariableContext } from './antlers/tags/core/session';
import { IReportableError, ISymbol } from './antlers/types';
import { UnclosedTagManager } from './antlers/unclosedTagManager';
import { DiagnosticsManager } from './diagnostics/diagnosticsManager';
import { checkSymbolForIssues } from './diagnostics/symbolChecker';
import { reloadProjectManifest } from './projects/manifest';
import { getProjectStructure, currentStructure, updateCurrentStructure } from './projects/statamicProject';
import { ReferenceManager } from './references/referenceManager';
import { SectionManager } from './references/sectionManager';
import { SessionVariableManager } from './references/sessionVariableManager';
import { connection } from './server';

const projectIndex = 'antlers-project-index';

let registeredProjectIndexToken = false;

let hasFoundProjectDetails = false,
	isFirstRun = true;

const parserInstances: Map<string, AntlersParser> = new Map();
const documentMap: Map<string, TextDocument> = new Map();

export async function collectProjectDetails(textDocument: TextDocument): Promise<void> {
	const docPath = decodeURIComponent(textDocument.uri),
		localPath = uri2path(docPath);


	if (hasFoundProjectDetails == false) {
		updateCurrentStructure(getProjectStructure(localPath));

		if (!registeredProjectIndexToken) {
			registeredProjectIndexToken = true;
			await connection.sendRequest(WorkDoneProgressCreateRequest.type, { token: projectIndex });
		}

		connection.sendProgress(WorkDoneProgress.type, projectIndex, { kind: 'begin', title: 'Analyzing Statamic Project' });
		ReferenceManager.clearPartialReferences(docPath);
		DiagnosticsManager.clearIssues(docPath);

		if (currentStructure != null) {
			for (let i = 0; i < currentStructure.views.length; i++) {
				const thisView = currentStructure.views[i];

				if (parserInstances.has(thisView.documentUri) == false) {
					parserInstances.set(thisView.documentUri, new AntlersParser());
				}

				const parser = parserInstances.get(thisView.documentUri) as AntlersParser;
				parser.parseText(thisView.documentUri, fs.readFileSync(thisView.path, { encoding: 'utf8' }), currentStructure);
				analyzeStructures(thisView.documentUri);
			}

			if (isFirstRun) {
				reloadProjectManifest();
				isFirstRun = false;
			}
		}

		connection.sendProgress(WorkDoneProgress.type, projectIndex, { kind: 'end', message: 'Analysis Complete' });

		hasFoundProjectDetails = false; // TODO: Make it so we can turn this back to "true" at some point.
	} else {
		ReferenceManager.clearPartialReferences(docPath);
		analyzeStructures(docPath);
	}
}

export function analyzeStructures(document: string) {
	if (parserInstances.has(document)) {
		const instance = parserInstances.get(document) as AntlersParser;

		DiagnosticsManager.clearIssues(document);
		ReferenceManager.clearAllReferences(document);
		UnclosedTagManager.clear(document);

		const fileSections: YieldContext[] = [],
			fileSessionVariables: SessionVariableContext[] = [],
			partialTags: ISymbol[] = [],
			cacheTags: ISymbol[] = [],
			unclosedTags: ISymbol[] = [];
		let documentErrors: IReportableError[] = [];

		for (let i = 0; i < instance.symbols.length; i++) {
			const symb = instance.symbols[i];

			if (symb.name === 'yield' || symb.name == 'yields') {
				const thisRef = symb.reference;

				if (thisRef != null && thisRef instanceof YieldContext) {
					fileSections.push(thisRef);
				}
			} else if (symb.name === 'partial') {
				partialTags.push(symb);
			} else if (symb.name === 'cache') {
				cacheTags.push(symb);
			} else if (symb.runtimeName == 'session:set' || symb.runtimeName == 'session:flash') {
				const thisRef = symb.reference;

				if (thisRef != null && thisRef instanceof SessionVariableContext) {
					fileSessionVariables.push(thisRef);
				}
			}
			if (symb.modifiers != null) {
				const modifierRef = getModifier(symb, 'partial');

				if (modifierRef != null && modifierRef.args.length > 0) {
					const partialNameRef = modifierRef.args[0].content.trim(),
						partialRef = currentStructure?.findPartial(partialNameRef);

					if (partialRef != null) {
						ReferenceManager.clearRemovesPageScope(partialRef.originalDocumentUri);
						ReferenceManager.setRemovesPageScope(partialRef.originalDocumentUri, symb);
					}
				}
			}

			if (symb.isTag) {
				const tagRef = TagManager.findTag(symb.runtimeName);

				if (tagRef != null && tagRef.requiresClose) {
					if (symb.isClosedBy == null) {
						unclosedTags.push(symb);
					}
				}
			} else if (symb.manifestType === 'array' && symb.isClosedBy == null) {
				unclosedTags.push(symb);
			}

			const reportedErrors = checkSymbolForIssues(symb);

			if (reportedErrors.length > 0) {
				documentErrors = documentErrors.concat(reportedErrors);
			}
		}

		if (unclosedTags.length > 0) {
			UnclosedTagManager.registerSymbols(document, unclosedTags);
		}

		InjectionManager.registerInjections(document, partialTags);
		SectionManager.registerDocumentSections(document, fileSections);
		ReferenceManager.registerPartialReferences(document, partialTags);
		ReferenceManager.registerCacheReferences(document, cacheTags);
		DiagnosticsManager.registerDiagnostics(document, documentErrors);
		SessionVariableManager.registerDocumentSessionVariables(document, fileSessionVariables);
	}
}

export { currentStructure, hasFoundProjectDetails, parserInstances, documentMap };
