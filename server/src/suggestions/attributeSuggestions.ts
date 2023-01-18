import { Range } from "vscode-languageserver-textdocument";
import {
    CompletionItem,
    CompletionItemKind,
    InsertTextFormat,
    TextEdit,
} from "vscode-languageserver-types";
import { IAntlersParameter } from "../antlers/tagManager";
import { ISuggestionRequest } from './suggestionRequest';

export function makeTagParameterSuggestions(
    request: ISuggestionRequest,
    parameters: IAntlersParameter[]
): CompletionItem[] {
    const paramSuggestions: CompletionItem[] = [];

    if (request.currentNode == null) {
        return paramSuggestions;
    }

    // Construct a document range.
    const range: Range = {
        start: {
            line: request.position.line,
            character: request.position.character - 0,
        },
        end: request.position,
    };

    for (let i = 0; i < parameters.length; i++) {
        const curParam = parameters[i];

        // Check if the tag already includes the parameter. If so, we ignore it.
        if (!request.currentNode.hasParameter(curParam.name)) {
            let insertParamName = curParam.name;

            if (request.leftWord != null && insertParamName.startsWith(request.leftWord)) {
                insertParamName = insertParamName.substring(request.leftWord.length);
            }

            const paramSnippet = insertParamName + '="$1"';

            paramSuggestions.push({
                label: curParam.name,
                kind: CompletionItemKind.Value,
                insertTextFormat: InsertTextFormat.Snippet,
                textEdit: TextEdit.replace(range, paramSnippet),
                command: {
                    title: "Suggest",
                    command: "editor.action.triggerSuggest",
                },
            });
        }
    }

    return paramSuggestions;
}
