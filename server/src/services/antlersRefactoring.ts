import { CodeAction, CodeActionParams } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { documentMap, sessionDocuments } from '../languageService/documents';
import ProjectManager from '../projects/projectManager';
import { makeProviderRequest } from '../providers/providerParameters';
import RefactoringManager from '../refactoring/refactoringManager';
import IRefactoringRequest from '../refactoring/refactoringRequest';
import { AntlersDocument } from '../runtime/document/antlersDocument';
import { globalSettings } from '../server';

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

    return RefactoringManager.getRefactors(refactorRequest);
}