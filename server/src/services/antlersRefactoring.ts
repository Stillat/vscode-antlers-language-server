import { CodeAction, CodeActionKind, CodeActionParams, Diagnostic, Range, TextEdit } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import DiagnosticsManager from '../diagnostics/diagnosticsManager';
import { documentMap, sessionDocuments } from '../languageService/documents';
import ProjectManager from '../projects/projectManager';
import { makeProviderRequest } from '../providers/providerParameters';
import RefactoringManager from '../refactoring/refactoringManager';
import IRefactoringRequest from '../refactoring/refactoringRequest';
import { ClassSearchResults } from '../runtime/analyzers/dynamicClassAnalyzer';
import { AntlersDocument } from '../runtime/document/antlersDocument';
import { AntlersErrorCodes } from '../runtime/errors/antlersErrorCodes';
import { ConditionNode } from '../runtime/nodes/abstractNode';
import { globalSettings } from '../server';

let currentDiagnostics: Diagnostic[] = [];

export function setCurDiagnostics(diagnostics:Diagnostic[]) {
    currentDiagnostics = diagnostics;
}

export function handleCodeActions(params: CodeActionParams): CodeAction[] {
    if (ProjectManager.instance?.hasStructure() == false) {
        return [];
    }

    sessionDocuments.refreshDocumentState();

    const docPath = decodeURIComponent(params.textDocument.uri);

    if (sessionDocuments.hasDocument(docPath) == false) {
        return [];
    }

    if (!documentMap.has(docPath)) {
        return [];
    }

    const position = params.range.start;

    const providerRequest = makeProviderRequest(position, docPath, globalSettings.showGeneralSnippetCompletions);
    if (providerRequest == null) { return []; }


    const textDocument = documentMap.get(docPath) as TextDocument,
        selectedText = textDocument.getText(params.range),
        selectedDocument = AntlersDocument.fromText(selectedText.trim());

    const refactorRequest: IRefactoringRequest = {
        params: providerRequest,
        selectedText: selectedText,
        selectedDocument: selectedDocument,
        ownerDocument: sessionDocuments.getDocument(docPath),
        documentUri: params.textDocument.uri,
        actionParams: params
    };

    let resolvedRefactors = RefactoringManager.getRefactors(refactorRequest);

    const errors = DiagnosticsManager.instance?.getDiagnostics(docPath);
    const handledNodes:string[] = [];
    if (errors != null && errors.length > 0) {
        errors?.forEach((error) => {
            if (error.errorCode == AntlersErrorCodes.LINT_DYNAMIC_CLASS_NAMES_POSSIBLE_PURGE) {
                const classResult = error.data as ClassSearchResults;

                if (error.node instanceof ConditionNode) {
                    let refactor = '';

                    for (let i = 0; i < error.node.logicBranches.length; i++) {
                        const curBranch = error.node.logicBranches[i];

                        if (i == error.node.logicBranches.length - 1) {
                            refactor += `{{${curBranch.head?.getTrueNode().sourceContent}}}`;
                            refactor += `${classResult.prefix}${curBranch.head?.documentText}${classResult.suffix}`;
                            refactor += `{{${curBranch.head?.isClosedBy?.getTrueNode().sourceContent}}}`;
                        } else {
                            refactor += `{{${curBranch.head?.getTrueNode().sourceContent}}}`;
                            refactor += `${classResult.prefix}${curBranch.head?.documentText}${classResult.suffix}`;
                        }
                    }

                    const edit: TextEdit = {
                        range: error.lsRange as Range,
                        newText: refactor,
                    }

                    const refDiag:Diagnostic[] = [];

                    if (currentDiagnostics.length > 0) {
                        currentDiagnostics.forEach((diag) => {
                            if (diag.range == error.lsRange) {
                                refDiag.push(diag);
                            }
                        });
                    }

                    let titleSuffix = '';

                    if (classResult.suffix.length > 0 && classResult.prefix.length > 0) {
                        titleSuffix = `${classResult.prefix}...${classResult.suffix}`;
                    } else if (classResult.suffix.length > 0) {
                        titleSuffix = `...${classResult.suffix}`;
                    } else if (classResult.prefix.length > 0) {
                        titleSuffix = `${classResult.prefix}...`;
                    }

                    if (classResult.classNames.length == 1 && classResult.patterns.length == 0) {
                        titleSuffix = classResult.classNames[0];
                    }

                    resolvedRefactors.push({
                        title: 'Dynamic CSS Class: ' + titleSuffix,
                        kind: CodeActionKind.QuickFix,
                        diagnostics: refDiag,
                        edit: {
                            changes: {
                                [params.textDocument.uri]: [edit]
                            }
                        }
                    });
                }
            }
        });
    }

    return resolvedRefactors;
}