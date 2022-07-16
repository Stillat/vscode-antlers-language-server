import {
    CompletionItem,
    CompletionItemKind,
    MarkupKind,
} from "vscode-languageserver-types";
import { IModifier } from '../antlers/modifierTypes';
import { IBlueprintField } from '../projects/blueprints/fields';

export function makeFieldSuggest(name: string, description: string, valueType: string): CompletionItem {
    const item: CompletionItem = {
        label: name,
        insertText: name,
        kind: CompletionItemKind.Field,
        detail: valueType + ": " + description,
    };

    return item;
}

function getTypedHeader(name: string, acceptsTypes: string[]): string {
    let typePart = "";

    if (acceptsTypes.length > 0) {
        const typeString = acceptsTypes.join(", ");

        typePart = typeString;
    }

    const header = "**" + name + "** `" + typePart + "`  \n";

    return header;
}

export function makeModifierSuggest(modifier: IModifier): CompletionItem {
    let value = getTypedHeader(modifier.name, modifier.acceptsType);

    let paramString = '';

    if (modifier.parameters.length > 0) {
        const paramNames: string[] = [];
        modifier.parameters.forEach((param) => {
            paramNames.push('$' + param.name);
        });

        paramString = paramNames.join(', ');
    }

    let returnString = '';

    if (modifier.returnsType.length == 1) {
        returnString = modifier.returnsType[0];
    } else {
        const returnNames: string[] = [];

        modifier.returnsType.forEach((type) => {
            returnNames.push(type);
        });

        returnString = returnNames.join(', ');
    }

    value += modifier.description + "\n";

    value += "```js\n";
    value += 'function ' + modifier.name + '(' + paramString + '):' + returnString;
    value += "\n```";


    if (modifier.docLink != null && modifier.docLink.trim().length > 0) {
        value += "  \n\n";
        value += '[Documentation Reference](' + modifier.docLink + ')';
    }

    const item: CompletionItem = {
        label: modifier.name,
        insertText: modifier.name,

        documentation: {
            kind: MarkupKind.Markdown,
            value: value,
        },
        kind: CompletionItemKind.Function,
    };

    return item;
}

export function formatSuggestionList(fields: IBlueprintField[]): CompletionItem[] {
    const items: CompletionItem[] = [];

    for (let i = 0; i < fields.length; i++) {
        if (typeof fields[i].name === "undefined") {
            continue;
        }

        items.push(formatSuggestion(fields[i]));
    }

    return items;
}

export function formatSuggestion(field: IBlueprintField): CompletionItem {
    let detail = "";
    let displayName = field.name;

    if (field.instructionText != null) {
        detail = field.instructionText;
    }

    if (field.displayName != null) {
        displayName = field.displayName + " (" + field.name + ")";
    }

    if (field.blueprintName != null) {
        if (detail.trim().length > 0) {
            detail += "\n";
        }

        detail += "Blueprint: " + field.blueprintName;
    }

    if (field.type != null) {
        displayName += ": " + field.type;
    }

    return {
        label: field.name,
        insertText: field.name,
        kind: CompletionItemKind.Field,
        documentation: detail,
        detail: displayName,
    };
}
