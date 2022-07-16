/* eslint-disable no-cond-assign */
import { Position } from "vscode-languageserver-textdocument";
import { IModifier } from "./modifierTypes";
import { IScopeVariable } from "./scope/types";

interface ISymbolModifier {
    /**
     * The parser content of the modifier.
     */
    content: string;
    /**
     * The source of the modifier instance.
     *
     * Possible values are:
     *     * shorthand
     *     * parameter
     */
    source: string;
    /**
     * The parsed name of the modifier.
     */
    name: string;
    /**
     * The start offset of the modifier.
     */
    startOffset: number;
    /**
     * The end offset of the modifier.
     */
    endOffset: number;
    /**
     * The line the modifier appears on in the source document.
     */
    line: number;
    /**
     * Indicates if the modifier references a known registered modifier.
     */
    hasRegisteredModifier: boolean;
    /**
     * The modifier reference, if available.
     */
    modifier: IModifier | null;
    /**
     * A list of user-supplied arguments to the modifier.
     */
    args: IModifierArgument[];
}

interface IModifierArgument {
    /**
     * The content of the modifier argument.
     */
    content: string;
    /**
     * The order in which the modifier appears in the call stack.
     */
    order: number;
    /**
     * The start offset of the modifier.
     */
    startOffset: number;
    /**
     * The end offset of the modifier,
     */
    endOffset: number;
    /**
     * The line the modifier appears on.
     */
    line: number;
    /**
     * The attached scope variable, if any.
     */
    scopeVariable: IScopeVariable | null;
}

function getActiveParameter(
    position: Position,
    modifier: ISymbolModifier
): number | null {
    const contentChars: string[] = modifier.content.split("");
    let isParsingString = false,
        stringTerminator = '"',
        currentParameterCount = 0;

    for (let i = 0; i < contentChars.length; i++) {
        const current = contentChars[i];
        let prev: string | null = null,
            next: string | null = null;

        if (i > 0) {
            prev = contentChars[i - 1];
        }

        if (i + 1 < contentChars.length) {
            next = contentChars[i + 1];
        }

        if (isParsingString == false) {
            if (current == '"' || current == "'") {
                isParsingString = true;
                stringTerminator = current;

                continue;
            }
        } else if (isParsingString == true && current == stringTerminator) {
            isParsingString = false;
            continue;
        }

        if (current == ":" && isParsingString == false) {
            currentParameterCount += 1;

            if (i + modifier.startOffset >= position.character) {
                break;
            }
        }
    }

    if (currentParameterCount == 0) {
        return null;
    }

    return currentParameterCount - 1;
}
