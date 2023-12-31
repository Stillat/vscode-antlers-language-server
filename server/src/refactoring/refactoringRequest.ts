import { CodeActionParams } from 'vscode-languageserver';;
import { AntlersDocument } from '../runtime/document/antlersDocument.js';
import { ISuggestionRequest } from '../suggestions/suggestionRequest.js';

interface IRefactoringRequest {
    params: ISuggestionRequest,
    selectedText: string,
    selectedDocument: AntlersDocument,
    ownerDocument: AntlersDocument,
    documentUri: string,
    actionParams: CodeActionParams
}

export default IRefactoringRequest;

