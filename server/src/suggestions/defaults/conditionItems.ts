import { Range } from 'vscode-languageserver-textdocument';
import { CompletionItem, CompletionItemKind, InsertTextFormat, TextEdit } from 'vscode-languageserver-types';
import { ISuggestionRequest } from '../suggestionRequest';
import { StringConditionItems } from './stringConditions';

export interface ICompletionCondition {
    name: string,
    description: string
}

export function getConditionCompletionItems(request: ISuggestionRequest): CompletionItem[] {
    const items: CompletionItem[] = [];

    const range: Range = {
        start: {
            line: request.position.line,
            character: request.position.character - request.originalLeftWord.length
        },
        end: request.position
    };

    for (let i = 0; i < StringConditionItems.length; i++) {
        const thisCondition = StringConditionItems[i];

        const snippet = request.originalLeftWord + thisCondition.name + '="$1"';

        items.push({
            label: thisCondition.name,
            insertTextFormat: InsertTextFormat.PlainText,
            kind: CompletionItemKind.Field,
        });
    }

    return items;
}
