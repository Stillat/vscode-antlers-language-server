import { CodeAction } from 'vscode-languageserver';
import TernaryHandler from './core/ternaryHandler';
import IRefactorHandler from './refactorHandler';
import IRefactoringRequest from './refactoringRequest';

class RefactoringManager {

    static getRefactors(params: IRefactoringRequest): CodeAction[] {
        const actions: CodeAction[] = [];
        const tempHandlers: IRefactorHandler[] = [];

        tempHandlers.push(new TernaryHandler());

        tempHandlers.forEach((handler) => {
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
