import { Hover, MarkupKind } from 'vscode-languageserver-types';
import { IModifier } from '../antlers/modifierManager';
import { IScopeVariable } from '../antlers/scope/engine';
import { IAntlersParameter, TagManager } from '../antlers/tagManager';
import { ISymbol } from '../antlers/types';
import { ExtensionManager } from '../extensibility/extensionManager';
import { IBlueprintField } from '../projects/blueprints';
import { ISuggestionRequest } from '../suggestions/suggestionManager';

export class HoverManager {

	static getTypedHeader(name: string, acceptsTypes: string[]): string {
		let typePart = '';

		if (acceptsTypes.length > 0) {
			const typeString = acceptsTypes.join(', ');

			typePart = '(*' + typeString + '*)';
		}

		const header = '**' + name + typePart + "**\n\n";

		return header;
	}

	static formatParmaeterHover(param: IAntlersParameter): Hover {
		let value = this.getTypedHeader(param.name, param.expectsTypes);

		value += param.description;

		return {
			contents: {
				kind: MarkupKind.Markdown,
				value: value
			}
		};
	}

	static formatModifierHover(modifier: IModifier): Hover {
		let value = this.getTypedHeader(modifier.name, modifier.acceptsType);

		value += modifier.description;

		return {
			contents: {
				kind: MarkupKind.Markdown,
				value: value
			}
		};
	}

	static formatBlueprintHover(blueprintField: IBlueprintField, introducedBy: ISymbol | null): Hover {
		let value = '';

		if (blueprintField.displayName != null && blueprintField.displayName.trim().length > 0) {
			value = '**' + blueprintField.displayName + '** (' + blueprintField.name + ")\n\n";
		} else {
			value = '**' + blueprintField.name + "**\n\n";
		}

		if (blueprintField.instructionText != null) {
			value += blueprintField.instructionText + "\n\n";
		}

		value += '**Blueprint**: ' + blueprintField.blueprintName + "\n\n";
		value += '**Type**: ' + blueprintField.type;

		if (blueprintField.maxItems != null) {
			value += "\n\n**Max Items**: " + blueprintField.maxItems;
		}

		if (introducedBy != null) {
			value += "\n\n**From**: " + introducedBy.runtimeName;
		}

		return {
			contents: {
				kind: MarkupKind.Markdown,
				value: value
			}
		};
	}

	static formatScopeVariableHover(scopeVariable: IScopeVariable): Hover {
		if (scopeVariable.sourceField != null) {
			return this.formatBlueprintHover(scopeVariable.sourceField, scopeVariable.introducedBy);
		}

		let value = '**' + scopeVariable.name + "**\n\n";

		value += '**Type**: ' + scopeVariable.dataType;

		if (scopeVariable.introducedBy != null) {
			value += "\n**From**: " + scopeVariable.introducedBy.runtimeName;
		}

		return {
			contents: {
				kind: MarkupKind.Markdown,
				value: value
			}
		};
	}

	static getHover(params: ISuggestionRequest): Hover | null {
		if (params.symbolsInScope.length == 0) {
			return null;
		}

		const lastSymbolInScope = params.symbolsInScope[params.symbolsInScope.length - 1];

		if (lastSymbolInScope != null) {
			if (TagManager.isKnownTag(lastSymbolInScope.runtimeName)) {
				const tagRef = TagManager.findTag(lastSymbolInScope.runtimeName);

				if (tagRef != null) {
					if (params.activeParameter != null) {
						const paramRef = TagManager.getParameter(tagRef.tagName, params.activeParameter.name);

						if (paramRef != null) {
							const extensionResult = ExtensionManager.collectParameterHover(paramRef, params);

							if (extensionResult != null) {
								return extensionResult;
							}

							return this.formatParmaeterHover(paramRef);
						} else if (params.activeParameter.modifier != null) {
							const extensionResult = ExtensionManager.collectModifierHover(params.activeParameter.modifier, params);

							if (extensionResult != null) {
								return extensionResult;
							}

							return this.formatModifierHover(params.activeParameter.modifier);
						}
					}

					return ExtensionManager.collectTagHover(tagRef, params);
				}
			}

			if (lastSymbolInScope.scopeVariable != null) {
				const extensionResult = ExtensionManager.collectScopeVariableHover(lastSymbolInScope.scopeVariable, params);

				if (extensionResult != null) {
					return extensionResult;
				}

				return this.formatScopeVariableHover(lastSymbolInScope.scopeVariable);
			}

			return ExtensionManager.collectGeneralHover(params);
		}

		return null;
	}

}
