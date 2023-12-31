import {
    CompletionItem,
    CompletionItemKind,
} from "vscode-languageserver-types";
import {
    exclusiveResult,
    ICompletionResult,
} from "../antlers/tagManager.js";
import { ParameterNode } from '../runtime/nodes/abstractNode.js';

export function getUniqueParameterArrayValuesSuggestions(paramAttribute: ParameterNode, allValues: string[]): ICompletionResult {
    const items: CompletionItem[] = [],
        paramValues: string[] = paramAttribute.getArrayValue(),
        valuesToUse = allValues.filter((e) => !paramValues.includes(e));

    for (let i = 0; i < valuesToUse.length; i++) {
        items.push({
            label: valuesToUse[i],
            kind: CompletionItemKind.Variable,
        });
    }

    return exclusiveResult(items);
}
