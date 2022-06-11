import { CodeAction } from 'vscode-languageserver';
import PartialHandler from './core/partialHandler';
import TernaryHandler from './core/ternaryHandler';
import IRefactorHandler from './refactorHandler';
import IRefactoringRequest from './refactoringRequest';

class RefactoringManager {

    static getRefactors(params: IRefactoringRequest): CodeAction[] {
        const actions: CodeAction[] = [];
        const tempHandlers: IRefactorHandler[] = [];

        tempHandlers.push(new TernaryHandler());
        tempHandlers.push(new PartialHandler());

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
