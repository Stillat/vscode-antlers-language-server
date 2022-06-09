import { CompletionItem, CompletionItemKind, MarkupKind } from 'vscode-languageserver';
import { DocumentDetailsManager } from '../../../../idehelper/documentDetailsManager';
import { IEnvironmentHelper } from '../../../../idehelper/parser';
import ProjectManager from '../../../../projects/projectManager';
import { IView } from '../../../../projects/views/view';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { exclusiveResult, IAntlersParameter, resultList } from '../../../tagManager';

export function resolvePartialParameterCompletions(parameter: IAntlersParameter, params: ISuggestionRequest) {
    if (parameter.isDynamic) {
        if (params.currentNode != null && params.currentNode.getTagName() == "partial" && params.currentNode.hasMethodPart()) {
            const nodeMethodName = params.currentNode.getMethodNameValue();

            if (nodeMethodName.trim().length > 0) {
                if (ProjectManager.instance?.hasStructure()) {
                    const projectView = ProjectManager.instance
                        .getStructure()
                        .findRelativeView(nodeMethodName);

                    if (
                        projectView != null &&
                        projectView.varReferenceNames.has(parameter.name)
                    ) {
                        const viewDataRef = projectView.varReferenceNames.get(
                            parameter.name
                        ) as string;


                        if (projectView.document != null) {
                            if (projectView.document.hasFrontMatter()) {
                                const frontMatterScope = projectView.document.getFrontMatterScope();
    
                                if (frontMatterScope != null) {
                                    const scopeRef = frontMatterScope.getList(viewDataRef);

                                    if (scopeRef != null) {
                                        return resultList(scopeRef.getVariableNames());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (parameter.name == 'src') {
        const partials = params.project.getViews(),
            completionItems: CompletionItem[] = [];

        partials.forEach((view: IView) => {
            if (DocumentDetailsManager.hasDetails(view.documentUri)) {
                const partialDetails = DocumentDetailsManager.documentDetails.get(
                    view.documentUri
                ) as IEnvironmentHelper;

                completionItems.push({
                    label:
                        partialDetails.documentName +
                        "(" +
                        view.relativeDisplayName +
                        ")",
                    insertText: view.relativeDisplayName,
                    detail: partialDetails.documentName,
                    documentation: {
                        kind: MarkupKind.Markdown,
                        value: partialDetails.documentDescription,
                    },
                    kind: CompletionItemKind.File,
                });
            } else {
                completionItems.push({
                    label: view.relativeDisplayName,
                    kind: CompletionItemKind.File,
                });
            }
        });

        return exclusiveResult(completionItems);
    }

    return null;
}