import { CodeActionParams } from 'vscode-languageserver';
import { AntlersDocument } from '../runtime/document/antlersDocument';
import { ISuggestionRequest } from '../suggestions/suggestionRequest';

interface IRefactoringRequest {
    params: ISuggestionRequest,
    selectedText: string,
    selectedDocument: AntlersDocument,
    ownerDocument: AntlersDocument,
    documentUri: string,
    actionParams: CodeActionParams
}

export default IRefactoringRequest;

