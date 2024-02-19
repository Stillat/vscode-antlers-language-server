import { CompletionItem, CompletionItemKind, InsertTextFormat, MarkupKind, TextEdit, } from "vscode-languageserver";
import { Range } from "vscode-languageserver-textdocument";
import { DocumentDetailsManager } from "../../../../idehelper/documentDetailsManager.js";
import { IEnvironmentHelper } from "../../../../idehelper/parser.js";
import { sessionDocuments } from '../../../../languageService/documents.js';
import { IView } from "../../../../projects/views/view.js";
import { AntlersNode } from '../../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { tagToCompletionItem } from '../../../documentedLabel.js';
import { IAntlersParameter, IAntlersTag, nonExclusiveResult, } from "../../../tagManager.js";
import { returnDynamicParameter } from "../../dynamicParameterResolver.js";
import PartialExists from './partialExists.js';
import PartialIfExists from './partialIfExists.js';
import { PartialParameters } from './partialParameters.js';
import { getViewName } from './partialUtilities.js';
import { resolvePartialParameterCompletions } from './resolvePartialParameterCompletions.js';

const PartialCompletionItems: CompletionItem[] = [
    tagToCompletionItem(PartialExists),
    tagToCompletionItem(PartialIfExists)
];

const Partial: IAntlersTag = {
    tagName: "partial",
    hideFromCompletions: false,
    injectParentScope: false,
    allowsArbitraryParameters: true,
    parameters: PartialParameters,
    requiresClose: false,
    allowsContentClose: true,
    introducedIn: null,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return `**Partial Tag**  
Includes another view into the current template.  

[Documentation Reference](https://statamic.dev/tags/partial)
`;
    },
    resolveDynamicParameter: returnDynamicParameter,
    resovleParameterCompletionItems: resolvePartialParameterCompletions,
    resolveCompletionItems: (params: ISuggestionRequest) => {
        let items: CompletionItem[] = [];

        if (params.leftChar == '"' && params.leftWord == ':src="') {
            return {
                items: [],
                analyzeDefaults: true,
                isExclusiveResult: false,
            };
        }

        if (((params.leftWord == "partial" || params.leftWord == "/partial") && params.leftChar == ":") || (params.leftWord == 'src="' && params.leftChar == '"')) {
            const partials = params.project.getViews();

            partials.forEach((view: IView) => {
                const decodedUri = decodeURIComponent(view.documentUri);
                if (DocumentDetailsManager.hasDetails(decodedUri)) {
                    const partialDetails = DocumentDetailsManager.documentDetails.get(decodedUri) as IEnvironmentHelper;

                    items.push({
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
                    items.push({
                        label: view.relativeDisplayName,
                        kind: CompletionItemKind.File,
                    });
                }
            });

            if (params.leftWord != 'src="') {
                items = items.concat(PartialCompletionItems);
            }

            return {
                analyzeDefaults: false,
                isExclusiveResult: true,
                items,
            };
        }

        if (params.currentNode != null && params.project != null) {
            const viewName = getViewName(params.currentNode);

            if (viewName != null && viewName.trim().length > 0) {
                const viewRef = params.project.findRelativeView(viewName);

                if (viewRef != null) {
                    if (sessionDocuments.hasDocument(viewRef.documentUri)) {
                        const docInstance = sessionDocuments.getDocument(
                            viewRef.documentUri
                        );

                        if (docInstance != null) {
                            const symbols = docInstance.getAllAntlersNodes(),
                                variableNames = getVariableNames(symbols),
                                addedNames: string[] = [];

                            if (viewRef.varReferenceNames != null) {
                                viewRef.varReferenceNames.forEach((val, varName) => {
                                    variableNames.push(varName);
                                });
                            }

                            const completionItems: CompletionItem[] = [];

                            if (viewRef.injectsParameters.length > 0) {
                                const range: Range = {
                                    start: {
                                        line: params.position.line,
                                        character: params.position.character - 0,
                                    },
                                    end: params.position,
                                };

                                viewRef.injectsParameters.forEach((parameter: IAntlersParameter) => {
                                    const paramSnippet = parameter.name + '="$1"';

                                    if (addedNames.includes(parameter.name)) {
                                        return;
                                    }

                                    addedNames.push(parameter.name);

                                    completionItems.push({
                                        label: parameter.name,
                                        kind: CompletionItemKind.Value,
                                        detail: parameter.description,
                                        insertTextFormat: InsertTextFormat.Snippet,
                                        textEdit: TextEdit.replace(range, paramSnippet),
                                        command: {
                                            title: "Suggest",
                                            command: "editor.action.triggerSuggest",
                                        },
                                    });
                                });
                            }

                            if (variableNames.length > 0) {
                                const range: Range = {
                                    start: {
                                        line: params.position.line,
                                        character: params.position.character - 0,
                                    },
                                    end: params.position,
                                };

                                variableNames.forEach((variableName: string) => {
                                    const paramSnippet = variableName + '="$1"';

                                    if (addedNames.includes(variableName)) {
                                        return;
                                    }

                                    addedNames.push(variableName);

                                    completionItems.push({
                                        label: variableName,
                                        kind: CompletionItemKind.Value,
                                        insertTextFormat: InsertTextFormat.Snippet,
                                        textEdit: TextEdit.replace(range, paramSnippet),
                                        command: {
                                            title: "Suggest",
                                            command: "editor.action.triggerSuggest",
                                        },
                                    });
                                });
                            }

                            return nonExclusiveResult(completionItems);
                        }
                    }
                }
            }
        }

        return {
            analyzeDefaults: true,
            isExclusiveResult: false,
            items: [],
        };
    },
};



function getVariableNames(symbols: AntlersNode[]): string[] {
    const namesToReturn: string[] = [];

    symbols.forEach((symbol: AntlersNode) => {
        if (symbol.isTagNode || symbol.isClosingTag) {
            return;
        }

        if (symbol.isComment) {
            return;
        }

        if (symbol.hasMethodPart() && symbol.getMethodNameValue().length > 0) {
            return;
        }

        if (symbol.name != null && symbol.name.content.includes("[")) {
            return;
        }

        const nodeTagName = symbol.getTagName();

        if (
            !namesToReturn.includes(nodeTagName) &&
            nodeTagName != "#" &&
            nodeTagName != "slot"
        ) {
            namesToReturn.push(nodeTagName);
        }
    });

    return namesToReturn;
}


export default Partial;
