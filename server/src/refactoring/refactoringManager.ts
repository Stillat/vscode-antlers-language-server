import { CodeAction } from 'vscode-languageserver';
import ExtractPartialHandler from './core/extractPartialHandler';
import TernaryHandler from './core/ternaryHandler';
import IRefactorHandler from './refactorHandler';
import IRefactoringRequest from './refactoringRequest';

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
