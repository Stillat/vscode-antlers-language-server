import { CodeAction } from 'vscode-languageserver';
import IRefactoringRequest from './refactoringRequest';

interface IRefactorHandler {
    getName(request:IRefactoringRequest):string,
    canHandle(request:IRefactoringRequest):boolean,
    refactor(request:IRefactoringRequest):CodeAction[]
}

export default IRefactorHandler;
