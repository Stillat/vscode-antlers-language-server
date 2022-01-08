import { Hover, MarkupKind } from "vscode-languageserver-types";
import ModifierManager from '../antlers/modifierManager';
import { IModifier } from '../antlers/modifierTypes';
import { IScopeVariable } from '../antlers/scope/types';
import { IAntlersParameter } from "../antlers/tagManager";
import TagManager from '../antlers/tagManagerInstance';
import { IBlueprintField } from '../projects/blueprints/fields';
import { AntlersNode } from '../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../suggestions/suggestionRequest';
import { antlersPositionToVsCode } from '../utils/conversions';

export class HoverManager {
    static getTypedHeader(name: string, acceptsTypes: string[]): string {
        let typePart = "";

        if (acceptsTypes.length > 0) {
            const typeString = acceptsTypes.join(", ");

            typePart = typeString;
        }

        const header = "**" + name + "** `" + typePart + "`  \n";

        return header;
    }

    static formatParameterHover(param: IAntlersParameter): Hover {
        let value = this.getTypedHeader(param.name, param.expectsTypes);

        value += param.description;

        if (param.documentationLink != null && param.documentationLink.trim().length > 0) {
            value += "  \n\n";

            let linkName = 'Documentation Reference]';

            if (param.docLinkName != null && param.docLinkName.trim().length > 0) {
                linkName = param.docLinkName.trim();
            }

            value += '[' + linkName + '](' + param.documentationLink + ')';
        }

        return {
            contents: {
                kind: MarkupKind.Markdown,
                value: value,
            },
        };
    }

    static formatModifierHover(modifier: IModifier): Hover {
        let value = this.getTypedHeader(modifier.name, modifier.acceptsType);

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

        return {
            contents: {
                kind: MarkupKind.Markdown,
                value: value,
            },
        };
    }

    static formatBlueprintHover(
        blueprintField: IBlueprintField,
        introducedBy: AntlersNode | null
    ): Hover {
        let value = "";

        if (
            blueprintField.displayName != null &&
            blueprintField.displayName.trim().length > 0
        ) {
            value =
                "**" +
                blueprintField.displayName +
                "** (" +
                blueprintField.name +
                ")\n\n";
        } else {
            value = "**" + blueprintField.name + "**\n\n";
        }

        if (blueprintField.instructionText != null) {
            value += blueprintField.instructionText + "\n\n";
        }

        value += "**Blueprint**: " + blueprintField.blueprintName + "\n\n";
        value += "**Type**: " + blueprintField.type;

        if (blueprintField.maxItems != null) {
            value += "\n\n**Max Items**: " + blueprintField.maxItems;
        }

        if (introducedBy != null) {
            value += "\n\n**From**: " + introducedBy.runtimeName();
        }

        return {
            contents: {
                kind: MarkupKind.Markdown,
                value: value,
            },
        };
    }

    static formatScopeVariableHover(scopeVariable: IScopeVariable): Hover {
        if (scopeVariable.sourceField != null) {
            return this.formatBlueprintHover(
                scopeVariable.sourceField,
                scopeVariable.introducedBy
            );
        }

        let value = "**" + scopeVariable.name + "**\n\n";

        value += "**Type**: " + scopeVariable.dataType;

        if (scopeVariable.introducedBy != null) {
            value += "\n**From**: " + scopeVariable.introducedBy.runtimeName();
        }

        return {
            contents: {
                kind: MarkupKind.Markdown,
                value: value,
            },
        };
    }

    static getHover(params: ISuggestionRequest | null): Hover | null {
        if (params == null) {
            return null;
        }

        if (params.nodesInScope.length == 0) {
            return null;
        }

        let lastSymbolInScope = params.nodesInScope[params.nodesInScope.length - 1];

        if (params.context != null && params.context.node != null) {
            lastSymbolInScope = params.context.node;
        }

        if (lastSymbolInScope != null) {
            if (TagManager.instance?.isKnownTag(lastSymbolInScope.runtimeName())) {
                const tagRef = TagManager.instance?.findTag(lastSymbolInScope.runtimeName());

                if (params.context != null && params.context.isCursorInIdentifier) {
                    if (typeof tagRef?.resolveDocumentation != 'undefined') {
                        const resolvedDocs = tagRef.resolveDocumentation(params);

                        if (resolvedDocs.trim().length > 0) {
                            return {
                                contents: {
                                    kind: MarkupKind.Markdown,
                                    value: resolvedDocs,
                                },
                                range: {
                                    start: antlersPositionToVsCode(lastSymbolInScope.startPosition),
                                    end: antlersPositionToVsCode(lastSymbolInScope.endPosition)
                                }
                            };
                        }
                    }
                }

                if (tagRef != null) {
                    if (params.context?.parameterContext?.parameter != null) {
                        const tActiveParam = params.context.parameterContext.parameter,
                            paramRef = TagManager.instance.getParameter(tagRef.tagName, tActiveParam.name);
                        if (paramRef != null) {
                            if (typeof paramRef.providesDocumentation !== 'undefined') {
                                const resolvedDocs = paramRef.providesDocumentation(params);

                                if (resolvedDocs.trim().length > 0) {

                                    return {
                                        contents: {
                                            kind: MarkupKind.Markdown,
                                            value: resolvedDocs,
                                        },
                                        range: {
                                            start: antlersPositionToVsCode(lastSymbolInScope.startPosition),
                                            end: antlersPositionToVsCode(lastSymbolInScope.endPosition)
                                        }
                                    };
                                }
                            }

                            return this.formatParameterHover(paramRef);
                        } else if (tActiveParam.isModifierParameter && tActiveParam.modifier != null) {
                            return this.formatModifierHover(tActiveParam.modifier);
                        }
                    }
                }
            }

            if (params.context?.parameterContext != null) {
                if (params.context?.parameterContext.parameter?.modifier != null) {
                    return this.formatModifierHover(params.context.parameterContext.parameter.modifier);
                }
            }

            if (params.context?.modifierContext != null) {
                const modifierRef = ModifierManager.instance?.getModifier(params.context.modifierContext.name);

                if (modifierRef != null) {
                    return this.formatModifierHover(modifierRef);
                }
            }

            if (lastSymbolInScope.scopeVariable != null) {
                return this.formatScopeVariableHover(lastSymbolInScope.scopeVariable);
            }

            return null;
        }

        return null;
    }
}
