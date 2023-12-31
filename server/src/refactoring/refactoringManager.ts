import { CodeAction } from 'vscode-languageserver';;
import ExtractPartialHandler from './core/extractPartialHandler.js';
import TernaryHandler from './core/ternaryHandler.js';
import IRefactorHandler from './refactorHandler.js';
import IRefactoringRequest from './refactoringRequest.js';

class RefactoringManager {

    static getRefactors(params: IRefactoringRequest): CodeAction[] {
        const actions: CodeAction[] = [],
            handlers: IRefactorHandler[] = [];

        handlers.push(new ExtractPartialHandler());
        handlers.push(new TernaryHandler());

        handlers.forEach((handler) => {
            if (handler.canHandle(params)) {
                handler.refactor(params).forEach((refactor) => {
                    actions.push(refactor);
                });
            }
        });

        return actions;
    }

}

export default RefactoringManager;
