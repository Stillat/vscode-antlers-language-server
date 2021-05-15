import { Position } from 'vscode-languageserver-textdocument';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { ExtensionManager } from '../extensibility/extensionManager';
import { IBlueprintField } from '../projects/blueprints';
import { StatamicProject } from '../projects/statamicProject';
import { makeTagParameterSuggestions } from '../suggestions/attributeSuggestions';
import { formatSuggestion, makeModifierSuggest } from '../suggestions/fieldFormatter';
import { ISuggestionRequest } from '../suggestions/suggestionManager';
import { trimLeft } from '../utils/strings';
import { IModifier, ModifierManager } from './modifierManager';
import { Scope } from './scope/engine';
import { coreTags } from './tags/coreTags';
import { IReportableError, ISpecialResolverResults, ISymbol } from './types';

export interface IParameterAttribute {
	/**
	 * The user supplied parameter name.
	 */
	name: string,
	/**
	 * The user supplied parameter value.
	 */
	value: string,
	/**
	 * The offset at which the parameter value starts.
	 */
	contentStartsAt: number,
	/**
	 * The start offset of the entire parameter.
	 */
	startOffset: number,
	/**
	 * The end offset of the entire parameter.
	 */
	endOffset: number,
	/**
	 * Indicates if the parameter contains dynamic bindings (variable reference).
	 * 
	 * An example is ':src="variable"'.
	 */
	isDynamicBinding: boolean,
	/**
	 * Indicates if the parameter name contains multiple pieces.
	 * 
	 * An example is 'title:contains'.
	 */
	isCompound: boolean,
	/**
	 * Inddicates if the parameter value contains any interpolation ranges.
	 */
	containsInterpolation: boolean
	/**
	 * A list of all interpolation ranges within the parameter's value.
	 */
	interpolations: IVariableInterpolation[],
	/**
	 * Indicates if the parameter can be associated with a known modifier instance.
	 */
	isModifier: boolean,
	/**
	 * The associated modifier instance, if available.
	 */
	modifier: IModifier | null
}

export interface IVariableInterpolation {
	/**
	 * The user-supplied value of the interpolation range.
	 */
	value: string,
	/**
	 * The start offset of the interpolation range.
	 */
	startOffset: number,
	/**
	 * The end offset of the interpolation range.
	 */
	endOffset: number,
	/**
	 * A list of all symbols that represent the full range.
	 */
	symbols: ISymbol[]
}

export interface IProviderCompletionResult {
	items: CompletionItem[],
	isExclusive: boolean
}

export interface IAntlersParameter {
	/**
	 * The name of the parameter.
	 */
	name: string,
	/**
	 * Indicates if the parameter is required to use the tag.
	 */
	isRequired: boolean,
	/**
	 * A user-friendly description of the parameter.
	 */
	description: string,
	/**
	 * Indicates whether the parameter was dynamically created, or not.
	 */
	isDynamic: boolean,
	/**
	 * A list of optional aliases for the parameter.
	 */
	aliases: string[] | null,
	/**
	 * Indicates if the parameter accepts variable interpolation.
	 * 
	 * Example: some="{value}"
	 */
	acceptsVariableInterpolation: boolean,
	/**
	 * Indicates if the parameter accepts variable references.
	 * 
	 * Example: :some="value"
	 */
	allowsVariableReference: boolean,
	/**
	 * A list of expected types for the parameter.
	 * 
	 * Allowed values are:
	 *   *       - Any
	 *   string  - string
	 *   date    - date
	 *   number  - numeric
	 *   array   - array
	 *   boolean - boolean
	 */
	expectsTypes: string[],
	/**
	 * Provides an opportunity to report any errors with the parameter's contents.
	 * 
	 * @param {ISymbol} symbol The symbol being analyzed.
	 * @param {IParameterAttribute} parameter The parameter being analyzed.
	 */
	validate?(symbol: ISymbol, parameter: IParameterAttribute): IReportableError[]
}

const DnyamicParameter: IAntlersParameter = {
	name: 'dynamic',
	acceptsVariableInterpolation: false,
	aliases: [],
	allowsVariableReference: true,
	description: '',
	expectsTypes: ['string', 'number', 'array', 'boolean'],
	isRequired: false,
	isDynamic: true
};

export { DnyamicParameter };

export function dynamicParameter(name: string): IAntlersParameter {
	return {
		name: name,
		acceptsVariableInterpolation: false,
		aliases: [],
		allowsVariableReference: true,
		description: '',
		expectsTypes: ['string', 'number', 'array'],
		isRequired: false,
		isDynamic: true
	};
}

export interface IParameterSearchResult {
	inParameter: boolean,
	param: IParameterAttribute | null
}

export interface IRuntimeVariableType {
	/**
	 * An inferred value type.
	 */
	assumedType: string,
	/**
	 * Indicates if the represented variable references a collection.
	 */
	doesReferenceCollection: boolean,
	/**
	 * A list of all referenced blueprint fields.
	 */
	referencedFields: IBlueprintField[],
	/**
	 * The primary reference field, if available.
	 */
	referenceField: IBlueprintField | null,
	/**
	 * A list of a supplemental fields, if applicable.
	 */
	supplementedFields: IBlueprintField[] | null,
	/**
	 * A list of all known referenced collection names.
	 */
	collectionReferences: string[],
	/**
	 * Indicates if the represented variable references blueprints.
	 */
	referencesBlueprints: boolean
}

export interface ICompletionResult {
	/**
	 * A list of completion items to use, or merge in.
	 */
	items: CompletionItem[],
	/**
	 * Indicates if the items should be used exclusively.
	 */
	isExclusiveResult: boolean,
	/**
	 * Indicates if the engine should continue its default analysis.
	 * 
	 * Internal property.
	 */
	analyzeDefaults: boolean
}

export function exclusiveResultList(items: string[]): ICompletionResult {
	const completionItems: CompletionItem[] = [];

	for (let i = 0; i < items.length; i++) {
		completionItems.push({
			label: items[i],
			kind: CompletionItemKind.Field
		});
	}

	return exclusiveResult(completionItems);
}

export function exclusiveResult(items: CompletionItem[]): ICompletionResult {
	return {
		items: items,
		isExclusiveResult: true,
		analyzeDefaults: false
	};
}

export function nonExclusiveResult(items: CompletionItem[]): ICompletionResult {
	return {
		items: items,
		isExclusiveResult: false,
		analyzeDefaults: true
	};
}

const EmptyCompletionResult: ICompletionResult = {
	items: [],
	isExclusiveResult: false,
	analyzeDefaults: true
};

export { EmptyCompletionResult };

export interface IAntlersTag {
	/**
	 * The name of the tag. Tag names including the ':' character are acceptable.
	 */
	tagName: string,
	/**
	 * Indicates if the tag must be closed.
	 */
	requiresClose: boolean,
	/**
	 * If requiresClose is false, this can be used to indicate that the tag
	 * can be used like a variable, but it also acceptable to use a
	 * closing tag if the tag supports arbitrary user content.
	 */
	allowsContentClose: boolean,
	/**
	 * Indicates if the tag allows arbitrary user parameters.
	 * 
	 * Typically used if the tag performs filtering based on dynamic parameters,
	 * or to allow the template developer to pass-thru CSS styles and classes.
	 */
	allowsArbitraryParameters: boolean,
	/**
	 * When true, the scope engine will supply the tag instance with the
	 * previous scope's variables, lists, and any nested scopes.
	 */
	injectParentScope: boolean,
	/**
	 * A list of acceptable Antlers tag parmaeters.
	 */
	parameters: IAntlersParameter[],
	/**
	 * Indicates if this tag should be included in the completions result.
	 * 
	 * Typically used to hide an alias from the completions list, but allow
	 * the internal engines to provide analysis and language features
	 * when they are encountered. Examples are the 'member:' tags.
	 */
	hideFromCompletions: boolean,
	/**
	 * Allows the tag implementor to inject data into the active scope.
	 * 
	 * Implementations must always return the modified scope to use.
	 * 
	 * @param {ISymbol} symbol The active symbol adjusting scope.
	 * @param {Scope} scope The active scope.
	 */
	augmentScope?(symbol: ISymbol, scope: Scope): Scope,
	/**
	 * Provides an opportunity for tag authors to suggest alternative parameter names.
	 * 
	 * Useful for commonly confused tags, or common typos.
	 * 
	 * @param {string} unknown The name of the unknown parameter.
	 */
	suggestAlternativeParams?(unknown: string): string[],
	/**
	 * Provides an opportunity for tag authors to inspect the current 
	 * scope, as well as details about how the user is writing the
	 * template code, to determine if the tag should be closed.
	 * 
	 * @param {ISymbol} symbol The symbol being analyzed with respect to the tag.
	 */
	requiresCloseResolver?(symbol: ISymbol): boolean,
	/**
	 * Provides an opportunity to return a dynamic parameter instance
	 * to the internal engines when an unknown parameter is found.
	 * 
	 * @param {ISymbol} symbol The active symbol being analyzed.
	 * @param {string} paramName The encountered parameter name.
	 */
	resolveDynamicParameter?(symbol: ISymbol, paramName: string): IAntlersParameter | null,
	/**
	 * Allows tag authors to control what items are presented to the user when
	 * a completion request is triggered within an Antlers parameter.
	 * 
	 * @param {IAntlersParameter} parameter The active Antlers parameter.
	 * @param {ISuggestionRequest} params The original suggestion request.
	 */
	resovleParameterCompletionItems?(parameter: IAntlersParameter, params: ISuggestionRequest): ICompletionResult | null,
	/**
	 * Allows tag authors to contribute to the completions list within the current tag context.
	 * 
	 * @param {ISuggestionRequest} params The original suggestion request.
	 */
	resolveCompletionItems?(params: ISuggestionRequest): ICompletionResult,
	/**
	 * An internal method to resolve special symbol contexts to guide deeper analysis.
	 * 
	 * @param {ISymbol} context The active symbol being analyzed.
	 * @param {StatamicProject} project The active Statamic project.
	 */
	resolveSpecialType?(context: ISymbol, project: StatamicProject): ISpecialResolverResults
}

export interface ITagMethod {
	methodName: string,
	requiresClose: boolean
}

export class TagManager {
	static tags: Map<string, IAntlersTag> = new Map();
	static parameters: Map<string, Map<string, IAntlersParameter>> = new Map();

	static reset() {
		this.tags.clear();
		this.parameters.clear();

		this.loadCoreTags();
	}

	static getVisibleTagNames(): string[] {
		const tagNames: string[] = [];

		this.tags.forEach((tag: IAntlersTag, name: string) => {
			if (tag.hideFromCompletions == false) {
				tagNames.push(name);
			}
		});

		return [... new Set(tagNames)];
	}

	static getPossibleTagMethods(tagName: string): string[] {
		const methodNames: string[] = [],
			len = tagName.length + 1;

		this.tags.forEach((tag: IAntlersTag, name: string) => {
			if (name.startsWith(tagName)) {
				const methodName = name.substr(len).trim();

				if (methodName.length > 0) {
					methodNames.push(methodName);
				}
			}
		});

		return [... new Set(methodNames)];
	}

	static getTagNames(): string[] {
		const tagNames: string[] = [];

		this.tags.forEach((tag: IAntlersTag, name: string) => {
			tagNames.push(name);
		});

		return [... new Set(tagNames)];
	}

	static loadCoreTags() {
		this.registerTags(coreTags);
	}

	static cleanTagName(name: string): string {
		return trimLeft(name, '/');
	}

	static findTag(name: string): IAntlersTag | undefined {
		return this.tags.get(this.resolveTagName(name));
	}

	static isKnownTag(name: string): boolean {
		return this.tags.has(this.resolveTagName(name));
	}

	static isSymbolKnownTag(symbol: ISymbol): boolean {
		return this.isKnownTag(symbol.runtimeName);
	}

	static resolveTagName(name: string): string {
		name = this.cleanTagName(name.trim());

		// Handle the case of "most specific" tag.
		if (this.tags.has(name)) {
			return name;
		}

		if (name.includes(':')) {
			name = name.split(':')[0];
		}

		return name;
	}

	static canResolveSpecialTypes(name: string): boolean {
		// If the provided name can be resolve as-is
		// to a specific tag definition, we must
		// use that "most specific" definition.
		// e.g., collection:count is not
		// a collection named "count"
		// but a distinct tag entry.
		name = this.resolveTagName(name);

		const tag = this.tags.get(name) as IAntlersTag;

		if (typeof tag === 'undefined' || tag == null) {
			return false;
		}

		if (tag.resolveSpecialType == null) {
			return false;
		}

		return true;
	}

	static resolveSpecialType(tagName: string, symbol: ISymbol, project: StatamicProject): ISpecialResolverResults {
		tagName = this.resolveTagName(tagName);

		const tag = this.findTag(tagName) as IAntlersTag;

		if (tag.resolveSpecialType == null) {
			throw new Error(tagName + ' does not support special types.');
		}

		return tag.resolveSpecialType(symbol, project);
	}

	static isCaretInParameter(position: Position, symbol: ISymbol): IParameterSearchResult {
		const result: IParameterSearchResult = {
			inParameter: false,
			param: null
		};

		if (symbol.parameterCache != null && symbol.parameterCache.length > 0) {
			for (let i = 0; i < symbol.parameterCache.length; i++) {
				if (position.character > symbol.parameterCache[i].startOffset &&
					position.character <= symbol.parameterCache[i].endOffset) {
					result.inParameter = true;
					result.param = symbol.parameterCache[i];
					break;
				}
			}
		}

		return result;
	}

	static getCompletionItems(params: ISuggestionRequest): IProviderCompletionResult {
		let lastScopeItem = null;
		let resolvedParams: CompletionItem[] = [];
		let runDefaultAnalysis = true;

		if (params.symbolsInScope.length > 0) {
			lastScopeItem = params.symbolsInScope[params.symbolsInScope.length - 1];
		}

		if (params.currentSymbol != null) {
			if (this.isKnownTag(params.currentSymbol.runtimeName)) {
				const tagReference = this.findTag(params.currentSymbol.runtimeName) as IAntlersTag;


				if (typeof tagReference === 'undefined') {
					return {
						isExclusive: false, items: []
					};
				}

				resolvedParams = resolvedParams.concat(ExtensionManager.collectTagSuggestionLists(tagReference, params));

				const dynamicRefNames: string[] = [];

				if (tagReference.resolveCompletionItems != null) {
					const result = tagReference.resolveCompletionItems(params);

					if (result.isExclusiveResult) {
						return {
							isExclusive: true,
							items: result.items
						};
					}

					runDefaultAnalysis = result.analyzeDefaults;
					resolvedParams = resolvedParams.concat(result.items);
				}

				if (params.isPastTagPart == false) {
					const tagMethodNames = this.getPossibleTagMethods(tagReference.tagName);

					for (let i = 0; i < tagMethodNames.length; i++) {
						resolvedParams.push({
							label: tagMethodNames[i],
							kind: CompletionItemKind.Text
						});
					}
				}

				if (runDefaultAnalysis) {
					// Here we will gather the declared parameters and add them to make things easier.
					if (params.isCaretInTag == true && tagReference.parameters.length > 0) {
						resolvedParams = resolvedParams.concat(makeTagParameterSuggestions(params, tagReference.parameters));
					}

					for (let i = 0; i < params.symbolsInScope.length; i++) {
						if (params.symbolsInScope[i].runtimeType !== null) {
							const thisRuntimeType = params.symbolsInScope[i].runtimeType;

							if (thisRuntimeType != null && thisRuntimeType.assumedType == 'structure_ref' && thisRuntimeType.supplementedFields != null) {
								for (let j = 0; j < thisRuntimeType.supplementedFields.length; j++) {
									resolvedParams.push(formatSuggestion(thisRuntimeType.supplementedFields[j]));
								}
							}
						}
					}
				}

				return {
					items: resolvedParams, isExclusive: false
				};
			}
		}

		if (runDefaultAnalysis) {
			if (lastScopeItem != null && lastScopeItem.hasModifierSeparator) {
				if (lastScopeItem.runtimeType != null) {
					const typeSpecificModifiers = ModifierManager.getModifiersForType(lastScopeItem.runtimeType.assumedType);

					if (typeSpecificModifiers.length > 0) {
						for (let i = 0; i < typeSpecificModifiers.length; i++) {
							resolvedParams.push(makeModifierSuggest(typeSpecificModifiers[i]));
						}

						return {
							items: resolvedParams, isExclusive: false
						};
					}
				}
			}
		}

		return {
			items: resolvedParams, isExclusive: false
		};
	}

	static injectParentScope(tag: string): boolean {
		const tagReference = this.findTag(tag);

		if (typeof tagReference === 'undefined' || tagReference == null) {
			return true;
		}

		return tagReference.injectParentScope;
	}

	static resolveParameterCompletions(tag: string, parameter: IAntlersParameter, params: ISuggestionRequest): ICompletionResult | null {
		const tagReference = this.findTag(tag);

		if (typeof tagReference !== 'undefined' && tagReference !== null) {

			if (typeof tagReference.resovleParameterCompletionItems !== 'undefined' && tagReference.resovleParameterCompletionItems !== null) {
				return tagReference.resovleParameterCompletionItems(parameter, params);
			}
		}

		return null;
	}

	static canResolveDynamicParameter(tag: string): boolean {
		const tagName = this.resolveTagName(tag);

		if (this.isKnownTag(tagName)) {
			const tagRef = this.tags.get(tagName) as IAntlersTag;

			if (typeof tagRef === 'undefined') {
				return false;
			}

			if (typeof tagRef.resolveDynamicParameter !== 'undefined' && tagRef.resolveDynamicParameter != null) {
				return true;
			}
		}
		return false;
	}

	static getParameter(tag: string, param: string): IAntlersParameter | null {
		const tagName = this.resolveTagName(tag);

		if (this.parameters.has(tagName) == false) {
			return null;
		}

		const tagParams = this.parameters.get(tagName);

		if (tagParams == null) {
			return null;
		}

		if (tagParams.has(param) == false) {
			return null;
		}

		const tagParam = tagParams.get(param);

		if (typeof tagParam == 'undefined' || tagParams == null) {
			return null;
		}

		return tagParam;
	}

	static registerTags(tags: IAntlersTag[]) {
		for (let i = 0; i < tags.length; i++) {
			this.registerTag(tags[i]);
		}
	}

	static registerTag(tag: IAntlersTag) {
		this.tags.set(tag.tagName, tag);

		if (this.parameters.has(tag.tagName) == false) {
			this.parameters.set(tag.tagName, new Map());
		}

		if (tag.parameters.length > 0) {
			// Get a reference to this tag's specific parameter map.
			const thisTagsMap = this.parameters.get(tag.tagName);

			for (let i = 0; i < tag.parameters.length; i++) {
				const curParam = tag.parameters[i];

				thisTagsMap?.set(curParam.name, curParam);
			}
		}
	}

	static requiresClose(symbol: ISymbol): boolean {
		if (this.tags.has(symbol.name)) {
			const tag = this.findTag(symbol.name);

			if (tag != null) {
				if (tag.requiresCloseResolver != null) {
					return tag.requiresCloseResolver(symbol);
				}

				return tag.requiresClose;
			}
		}

		return false;
	}
}
