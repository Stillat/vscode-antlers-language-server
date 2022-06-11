import { CodeAction, CodeActionKind, Command, TextEdit, WorkspaceEdit } from 'vscode-languageserver';
import ProjectManager from '../../projects/projectManager';
import { normalizePath } from '../../utils/uris';
import IRefactorHandler from '../refactorHandler';
import IRefactoringRequest from '../refactoringRequest';
import * as fs from 'fs';
import * as path from "path";
import { requestEdits } from '../../server';

export interface IExtractedPartaialTargetFile {
    path: string,
    fsPath: string
}

class PartialHandler implements IRefactorHandler {
    static currentAction:PartialHandler | null = null;

    private activeRequest: IRefactoringRequest | null = null;

    getName(request: IRefactoringRequest): string {
        return 'Extract to Partial';
    }

    canHandle(request: IRefactoringRequest): boolean {
        return request.selectedText.trim().length > 0;
    }

    refactor(request: IRefactoringRequest): CodeAction[] {
        this.activeRequest = request;
        PartialHandler.currentAction = this;

        const name = this.getName(request),
        refactorCommand = CodeAction.create(
            name + '...',
            Command.create(
                name,
                'antlers.extractToPartial',
                request.documentUri
            ),
            CodeActionKind.RefactorExtract
        );

        return [refactorCommand];
    }

    completeRefactor(target:IExtractedPartaialTargetFile) {
        const structure = ProjectManager.instance?.getStructure();
        
        if (structure != null && this.activeRequest != null) {
            const viewPath = normalizePath(structure.getViewPath()),
                targetPath = normalizePath(target.fsPath);

            if (targetPath.startsWith(viewPath)) {
                fs.writeFileSync(target.fsPath, this.activeRequest.selectedText);
                // TODO: Figure out how to push the edit back up.
                //       Get relative view name, write a partial tag.

                let relativeDirName = targetPath.substring(viewPath.length);

                let partialName = path.basename(targetPath);

                if (partialName.startsWith('_')) {
                    partialName = partialName.substr(1);
                }

                relativeDirName = relativeDirName.substr(0, relativeDirName.length - partialName.length);

                if (partialName.endsWith('.antlers.html')) {
                    partialName = partialName.substring(0, partialName.length - 13);
                } else if (partialName.endsWith('.antlers.xml') || partialName.endsWith('antlers.php')) {
                    partialName = partialName.substring(0, partialName.length - 12);
                } else if (partialName.endsWith('.blade.php')) {
                    partialName = partialName.substring(0, partialName.length - 10);
                } else if (partialName.endsWith('.html')) {
                    partialName = partialName.substring(0, partialName.length - 5);
                }

                if (relativeDirName.length > 1) {
                    if (relativeDirName.endsWith('/') == false) {
                        relativeDirName = relativeDirName + '/';
                    }
                }

                const newTag = '{{ partial:' +  relativeDirName + partialName + ' }}';

                const textEdit:TextEdit = {
                    range: this.activeRequest.actionParams.range,
                    newText: newTag
                };

                const refactorEdit:WorkspaceEdit  = {
                    changes: {
                        [this.activeRequest.actionParams.textDocument.uri]: [
                            textEdit
                        ]
                    }
                };

                requestEdits(refactorEdit);
            }
        }
    }
}

export default PartialHandler;
