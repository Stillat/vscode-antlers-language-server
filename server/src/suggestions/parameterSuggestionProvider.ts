import {
    CompletionItem
} from "vscode-languageserver-types";
import { IAntlersParameter } from "../antlers/tagManager.js";
import { BooleanCompletionItems } from "./defaults/booleanItems.js";

export function getParameterCompletionItems(parameter: IAntlersParameter): CompletionItem[] {
    let itemsToReturn: CompletionItem[] = [];

    for (let i = 0; i < parameter.expectsTypes.length; i++) {
        const expectedType = parameter.expectsTypes[i];

        if (expectedType == "boolean") {
            itemsToReturn = itemsToReturn.concat(BooleanCompletionItems);
        }
    }

    return itemsToReturn;
}
