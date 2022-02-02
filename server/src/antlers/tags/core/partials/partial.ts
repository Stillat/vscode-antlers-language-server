import { CompletionItem, CompletionItemKind, InsertTextFormat, MarkupKind, TextEdit, } from "vscode-languageserver";
import { Range } from "vscode-languageserver-textdocument";
import { DocumentDetailsManager } from "../../../../idehelper/documentDetailsManager";
import { IEnvironmentHelper } from "../../../../idehelper/parser";
import { sessionDocuments } from '../../../../languageService/documents';
import { IView } from "../../../../projects/views/view";
import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { tagToCompletionItem } from '../../../documentedLabel';
import { IAntlersTag, nonExclusiveResult, } from "../../../tagManager";
import { returnDynamicParameter } from "../../dynamicParameterResolver";
import PartialExists from './partialExists';
import PartialIfExists from './partialIfExists';
import { PartialParameters } from './partialParameters';
import { resolvePartialParameterCompletions } from './resolvePartialParameterCompletions';

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

                            if (variableNames.length > 0) {
                                const completionItems: CompletionItem[] = [];
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

                                return nonExclusiveResult(completionItems);
                            }
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

function getViewName(node: AntlersNode) {
    if (node.getTagName() != "partial") {
        return null;
    }

    let partialName = "";

    if (node.hasMethodPart()) {
        partialName = node.getMethodNameValue();
    } else {
        const srcParam = node.findParameter("src");

        if (srcParam != null) {
            partialName = srcParam.value;
        }
    }

    return partialName;
}

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
