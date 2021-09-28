import { CompletionItem, CompletionItemKind, InsertTextFormat, TextEdit } from 'vscode-languageserver-protocol';
import { Position, Range } from 'vscode-languageserver-textdocument';
import { isCursorInsideSymbol, isPastTagPart } from '../antlers/concerns/resolvesPositionScope';
import { IModifier, ModifierManager } from '../antlers/modifierManager';
import { IScopeVariable, Scope } from '../antlers/scope/engine';
import { IAntlersParameter, IAntlersTag, IParameterAttribute, IVariableInterpolation, TagManager } from '../antlers/tagManager';
import { getMethodNameValue, ISymbol } from '../antlers/types';
import { UnclosedTagManager } from '../antlers/unclosedTagManager';
import { ContentVariableNames } from '../antlers/variables/contentVariables';
import { ExtensionManager } from '../extensibility/extensionManager';
import { StatamicProject } from '../projects/statamicProject';
import { trimLeft, trimRight } from '../utils/strings';
import { ConditionalSuggestionManager } from './conditionSuggestionManager';
import LanguageConstructs from './defaults/languageConstructs';
import { makeFieldSuggest, makeModifierSuggest } from './fieldFormatter';
import { GenericTypesSuggestions } from './genericTypesSuggestions';
import { getParameterCompletionItems } from './parameterSuggestionProvider';
import { ScopeVariableSuggestionsManager } from './scopeVariableSuggestionsManager';

const ConditionalCompletionTriggers: string[] = [
	'if', 'elseif'
];

const InvalidTriggers: string[] = [
	'else', '/if'
];

export function getCurrentSymbolMethodNameValue(params: ISuggestionRequest): string {
	let valueToReturnn = '';

	if (params.currentSymbol != null) {
		valueToReturnn = getMethodNameValue(params.currentSymbol);
	}

	return valueToReturnn;
}

export function getActiveParameterValue(params: ISuggestionRequest): string {
	let valueToReturn = '';

	if (params.activeParameter != null) {
		valueToReturn = params.activeParameter.value;
	}

	return valueToReturn;
}

export function getRoot(word: string): string {
	if (word.includes(':') == false) {
		return word;
	}

	const parts = word.split(':');


	if (parts.length > 1) {
		return parts[parts.length - 1];
	}

	return parts[0].trim();
}

export function getAbsoluteRoot(word: string): string {
	if (word.includes(':') == false) {
		return word;
	}

	return word.split(':')[0];
}

export interface ISuggestionRequest {
	/**
	 * The adjusted document URI.
	 */
	document: string,
	/**
	 * Indicates if the user's caret is within an Antlers tag.
	 */
	isCaretInTag: boolean,
	/**
	 * The character to the left of the user's caret.
	 */
	leftChar: string,
	/**
	 * The word to the left of the user's caret.
	 * 
	 * Calculated by consuming all characters until whitespace is encountered.
	 * This word is adjusted by trimming important Antlers characters from the left and right.
	 */
	leftWord: string,
	/**
	 * The word to the left of the user's caret.
	 * 
	 * Calculated by consuming all characters until whitespace, or the ':' character is encountered.
	 */
	leftMeaningfulWord: string | null,
	/**
	 * Same as leftWord, but no adjustments are made.
	 */
	originalLeftWord: string,
	/**
	 * The character to the right of the user's caret.
	 */
	rightChar: string,
	/**
	 * The word to the right of the user's caret.
	 * 
	 * Calculated by consuming all characters until whitespace is encountered.
	 */
	rightWord: string,
	/**
	 * The active parameter the caret is inside of, if any.
	 */
	activeParameter: IParameterAttribute | null,
	/**
	 * The active variable interpolation range the caret is inside of, if any.
	 */
	activeInterpolation: IVariableInterpolation | null,
	/**
	 * The position of the user's caret.
	 */
	position: Position,
	/**
	 * The active Statamic Project instance.
	 */
	project: StatamicProject,
	/**
	 * The active symbol the caret is inside of, if any.
	 */
	currentSymbol: ISymbol | null,
	/**
	 * A list of all symbols within the scope of the current position.
	 * 
	 * This list only considers symbols that have appeared before the caret position.
	 */
	symbolsInScope: ISymbol[],
	/**
	 * Indicates if the user's caret is within Antlers braces ('{{' and '}}').
	 */
	isInDoubleBraces: boolean,
	/**
	 * Indicates if the user's caret is within a variable interpolation range.
	 */
	isInVariableInterpolation: boolean,
	/**
	 * The offset the variable interpolation range starts on, if applicable.
	 */
	interpolationStartsOn: number | null,
	isPastTagPart: boolean
}

export function convertImmediateScopeToCompletionList(params: ISuggestionRequest): CompletionItem[] {
	if (params.symbolsInScope.length == 0) {
		return [];
	}

	const lastScopeItem = params.symbolsInScope[params.symbolsInScope.length - 1];

	if (lastScopeItem.currentScope == null) {
		return [];
	}

	return convertScopeToCompletionList(params, lastScopeItem.currentScope);
}

export function convertScopeToCompletionList(params: ISuggestionRequest, scope: Scope): CompletionItem[] {
	const items: CompletionItem[] = [];

	scope.values.forEach((val: IScopeVariable) => {
		if (val.sourceField != null) {
			items.push({
				label: val.name,
				detail: val.sourceField.blueprintName,
				documentation: val.sourceField.instructionText ?? '',
				kind: CompletionItemKind.Field
			});
		} else {
			items.push(makeFieldSuggest(val.name, '', ''));
		}

		if (val.dataType.trim().length > 0 && val.dataType == 'array') {
			const arrayCompleteSnippet = val.name + " }}\n    $1\n{{ /" + val.name + ' ',
				range: Range = {
					start: {
						line: params.position.line,
						character: params.position.character - params.originalLeftWord.length
					},
					end: params.position
				};

			items.push({
				label: val.name + ' loop',
				insertTextFormat: InsertTextFormat.Snippet,
				kind: CompletionItemKind.Snippet,
				textEdit: TextEdit.replace(range, arrayCompleteSnippet),
				command: {
					title: 'Suggest',
					command: 'editor.action.triggerSuggest'
				}
			});
		}
	});

	scope.lists.forEach((val: Scope, key: string) => {
		items.push(makeFieldSuggest(key, '', ''));
	});

	return items;
}

export function getModifierCompletionList(): CompletionItem[] {
	const items: CompletionItem[] = [];

	ModifierManager.registeredModifiers.forEach((modifier: IModifier) => {
		items.push(makeModifierSuggest(modifier));
	});

	return items;
}

export function shouldHandleModifierScopeInjections(params: ISuggestionRequest, lastScopeItem: ISymbol | null): boolean {

	if (params.isInVariableInterpolation && params.leftChar == '|') {
		return true;
	} else if (params.activeParameter != null && params.activeParameter.name == 'modifier' && (params.leftChar == '|' || params.leftChar == '"')) {
		return true;
	} else if (lastScopeItem != null && lastScopeItem.modifiers != null && lastScopeItem.modifiers.modifiers.length > 0) {
		if (params.position.character + 1 >= lastScopeItem.modifiers.modifiers[0].startOffset) {
			return true;
		}
	} else if (params.activeParameter != null && params.activeParameter.isDynamicBinding) {
		// In this situation, let's check if the caret is to the left of a "|" character.
		// If so, we will return true to enable the modifier suggestions list.
		const pipeIndex = params.activeParameter.value.indexOf('|');

		if (typeof pipeIndex !== 'undefined' && pipeIndex != null && pipeIndex >= 0) {
			const checkOffset = params.activeParameter.contentStartsAt + pipeIndex;

			if (params.position.character >= checkOffset && params.position.character <= params.activeParameter.endOffset) {
				return true;
			}
		}
	}

	return false;
}

export class SuggestionManager {

	static getSuggestions(params: ISuggestionRequest): CompletionItem[] {
		if (params.symbolsInScope.length == 0) {
			return [];
		}

		if (params.leftMeaningfulWord == null && params.leftChar == '/') {
			const unclosedTags = UnclosedTagManager.getUnclosedTags(params.document, params.position);

			if (unclosedTags.length > 0) {
				const closeTagCompletions: CompletionItem[] = [];
				let suffix = '';

				if (params.rightChar == '}') {
					suffix = ' ';
				}

				for (let i = 0; i < unclosedTags.length; i++) {
					closeTagCompletions.push({
						label: unclosedTags[i].runtimeName + suffix,
						kind: CompletionItemKind.Text
					});
				}

				return closeTagCompletions;
			}
		}

		const lastScopeItem = params.symbolsInScope[params.symbolsInScope.length - 1];
		let completionItems: CompletionItem[] = [],
			injectParentScope = true;

		if (shouldHandleModifierScopeInjections(params, lastScopeItem)) {
			completionItems = completionItems.concat(getModifierCompletionList());
			completionItems = completionItems.concat(ExtensionManager.collectModifierCompletionLists(params));
		}

		if (params.symbolsInScope.length >= 2) {
			const startIndex = params.symbolsInScope.length - 2;
			let scopeSymbolItems: CompletionItem[] = [];

			for (let i = startIndex; i >= 0; i--) {
				const symbolToAnalyze = params.symbolsInScope[i];

				scopeSymbolItems = scopeSymbolItems.concat(ScopeVariableSuggestionsManager.getVariableSuggestions(params, symbolToAnalyze));
			}

			if (scopeSymbolItems.length > 0) {
				completionItems = completionItems.concat(scopeSymbolItems);
			}
		}

		if (params.isInVariableInterpolation || (params.activeParameter == null && params.leftMeaningfulWord == null && params.leftChar != ':')) {

			if (isPastTagPart(lastScopeItem, params.position) == false) {
				const allTagNames = TagManager.getVisibleTagNames(),
					tagCompletions: CompletionItem[] = [];

				for (let i = 0; i < allTagNames.length; i++) {
					if (allTagNames[i].includes(':') == false) {
						tagCompletions.push({ label: allTagNames[i], kind: CompletionItemKind.Text });
					} else {
						const adjustedTagName = allTagNames[i].split(':')[0] as string;

						tagCompletions.push({
							label: adjustedTagName,
							kind: CompletionItemKind.Text
						});
					}
				}

				completionItems = completionItems.concat(tagCompletions);
			}
		}

		if (lastScopeItem != null && lastScopeItem.currentScope != null) {
			if (InvalidTriggers.includes(lastScopeItem.name)) {
				return [];
			}

			if (!isCursorInsideSymbol(lastScopeItem, params.position)) {
				return [];
			}

			if (ConditionalCompletionTriggers.includes(lastScopeItem.name)) {
				return ConditionalSuggestionManager.resolveConditionalCompletions(params, lastScopeItem);
			}

			if (lastScopeItem.isTag == false) {
				completionItems = completionItems.concat(LanguageConstructs);
				completionItems = completionItems.concat(ExtensionManager.collectGenericSuggetionLists(params));

				const range: Range = {
					start: {
						line: params.position.line,
						character: params.position.character - params.originalLeftWord.length
					},
					end: params.position
				};

				const ifElseSnippet = "if $1 }}\n    $2\n{{ else }}\n\n{{ /if ";
				completionItems.push({
					label: 'ifelse',
					insertTextFormat: InsertTextFormat.Snippet,
					kind: CompletionItemKind.Snippet,
					textEdit: TextEdit.replace(range, ifElseSnippet),
					command: {
						title: 'Suggest',
						command: 'editor.action.triggerSuggest'
					}
				});

				if (lastScopeItem.scopeVariable != null) {
					completionItems = completionItems.concat(GenericTypesSuggestions.getCompletions(params, lastScopeItem.scopeVariable));
				}
			}

			if (lastScopeItem.currentScope.hasListInHistory(lastScopeItem.tagPart) == false && lastScopeItem.currentScope.hasPristineReference(lastScopeItem.tagPart) == false) {
				injectParentScope = TagManager.injectParentScope(lastScopeItem.tagPart);
			} else {
				injectParentScope = false;
			}

			if (params.activeParameter != null) {
				if (params.activeParameter.isDynamicBinding == false) {
					injectParentScope = false;
				} else {
					if (params.isInVariableInterpolation == false) {
						injectParentScope = false;
					}
				}
			}

			if (lastScopeItem.isInterpolationSymbol == true) {
				injectParentScope = true;
			}

			// If we have a compound runtime name, lets check if we have a specific scope value here.
			if (lastScopeItem.tagPart.includes(':')) {
				if (lastScopeItem.currentScope.containsPath(trimRight(lastScopeItem.tagPart, ':'))) {
					const checkPath = trimRight(lastScopeItem.tagPart, ':'),
						checkWord = trimLeft(trimRight(params.leftWord, ':'), '{');

					// As the user is typing, we will attempt to provide the most specific results we can.
					if (checkPath == checkWord) {
						const specificScope = lastScopeItem.currentScope.findNestedScope(checkPath);

						if (specificScope != null) {
							specificScope.lists.forEach((val: Scope, key: string) => {
								completionItems.push(makeFieldSuggest(key, '', ''));
							});
							specificScope.values.forEach((val: IScopeVariable) => {
								if (val.sourceField != null) {
									completionItems.push({
										label: val.name,
										detail: val.sourceField.blueprintName,
										documentation: val.sourceField.instructionText ?? '',
										kind: CompletionItemKind.Field
									});
								} else {
									completionItems.push(makeFieldSuggest(val.name, '', ''));
								}
							});

							return completionItems;
						}
					}
				} else {

					if (lastScopeItem.isTag || (lastScopeItem.isTag && params.leftWord.trim().length == 0)) {
						if (params.isInVariableInterpolation && params.currentSymbol == null) {
							completionItems = completionItems.concat(convertScopeToCompletionList(params, lastScopeItem.currentScope.ancestor()));
						} else {
							if (params.activeParameter != null) {
								if (params.activeParameter.isDynamicBinding && params.position.character <= params.activeParameter.endOffset - 1) {
									completionItems = completionItems.concat(convertScopeToCompletionList(params, lastScopeItem.currentScope.ancestor()));
								} else {
									// Given some active parameter and a tag reference, can we provide a list of valid completion items?
									if (params.position.character < params.activeParameter.endOffset) {
										let tagParameter: IAntlersParameter | null = null,
											didSearchForDynamicParameter = false;

										if (TagManager.canResolveDynamicParameter(lastScopeItem.runtimeName)) {
											const tagRef = TagManager.findTag(lastScopeItem.runtimeName) as IAntlersTag;

											if (typeof tagRef !== 'undefined' && typeof tagRef.resolveDynamicParameter !== 'undefined' && tagRef.resolveDynamicParameter != null) {
												tagParameter = tagRef.resolveDynamicParameter(lastScopeItem, params.activeParameter.name);
												didSearchForDynamicParameter = true;
											}
										} else {
											tagParameter = TagManager.getParameter(lastScopeItem.runtimeName, params.activeParameter.name);
										}

										if (tagParameter == null && didSearchForDynamicParameter) {
											tagParameter = TagManager.getParameter(lastScopeItem.runtimeName, params.activeParameter.name);
										}

										if (typeof tagParameter !== 'undefined' && tagParameter !== null) {
											const tagReferenceResult = TagManager.resolveParameterCompletions(lastScopeItem.tagPart, tagParameter, params);

											if (tagReferenceResult !== null && tagReferenceResult.items.length > 0) {
												completionItems = completionItems.concat(tagReferenceResult.items);
											} else {
												completionItems = completionItems.concat(getParameterCompletionItems(tagParameter));
											}

											completionItems = completionItems.concat(ExtensionManager.collectParameterCompletionLists(tagParameter, params));
										}

										if (params.activeParameter.containsInterpolation && params.isInVariableInterpolation && lastScopeItem.isTag) {
											const interpolatedTagRef = TagManager.findTag(lastScopeItem.runtimeName) as IAntlersTag;

											completionItems = completionItems.concat(ExtensionManager.collectTagSuggestionLists(interpolatedTagRef, params));

											if (interpolatedTagRef.resolveCompletionItems != null) {
												const interpolatedResults = interpolatedTagRef.resolveCompletionItems(params);

												if (interpolatedResults.items.length > 0) {
													completionItems = interpolatedResults.items;
												}
											}
										}
									}
								}
							} else {
								const caretInSymbolOpen = isCursorInsideSymbol(lastScopeItem, params.position);

								params.isCaretInTag = caretInSymbolOpen;
								params.currentSymbol = lastScopeItem;

								const tagManagerResult = TagManager.getCompletionItems(params);

								if (tagManagerResult.isExclusive) {
									completionItems = tagManagerResult.items;
								} else {
									completionItems = completionItems.concat(tagManagerResult.items);
								}
							}
						}
					} else if (params.isInVariableInterpolation && params.currentSymbol == null) {
						completionItems = completionItems.concat(convertScopeToCompletionList(params, lastScopeItem.currentScope.ancestor()));
					} else {
						// Do nothing for now.
						// completionItems = [];
					}

					// If we are in this execution branch, the user
					// has triggered completion on an item that
					// cannot be located in the scope. Instead
					// of returning the default scope, we
					// will return an empty list to
					// prevent "false positives".
					// return completionItems;
				}
			} else {
				// Handle the case where the provided tag part does not include a ":" character.
				if (lastScopeItem.isTag || (lastScopeItem.isTag && params.leftWord.trim().length == 0)) {
					if (params.isInVariableInterpolation && params.currentSymbol == null) {
						completionItems = completionItems.concat(convertScopeToCompletionList(params, lastScopeItem.currentScope.ancestor()));
					} else {
						if (params.activeParameter != null) {
							if (params.activeParameter.isDynamicBinding && params.position.character <= params.activeParameter.endOffset - 1) {
								completionItems = completionItems.concat(convertScopeToCompletionList(params, lastScopeItem.currentScope.ancestor()));
							} else {
								// Given some active parameter and a tag reference, can we provide a list of valid completion items?
								if (params.position.character < params.activeParameter.endOffset) {
									let tagParameter: IAntlersParameter | null = null,
										didSearchForDynamicParameter = false;

									if (TagManager.canResolveDynamicParameter(lastScopeItem.runtimeName)) {
										const tagRef = TagManager.findTag(lastScopeItem.runtimeName) as IAntlersTag;

										if (typeof tagRef !== 'undefined' && typeof tagRef.resolveDynamicParameter !== 'undefined' && tagRef.resolveDynamicParameter != null) {
											tagParameter = tagRef.resolveDynamicParameter(lastScopeItem, params.activeParameter.name);
											didSearchForDynamicParameter = true;
										}
									} else {
										tagParameter = TagManager.getParameter(lastScopeItem.runtimeName, params.activeParameter.name);
									}

									if (tagParameter == null && didSearchForDynamicParameter) {
										tagParameter = TagManager.getParameter(lastScopeItem.runtimeName, params.activeParameter.name);
									}

									if (typeof tagParameter !== 'undefined' && tagParameter !== null) {
										const tagReferenceResult = TagManager.resolveParameterCompletions(lastScopeItem.tagPart, tagParameter, params);

										if (tagReferenceResult !== null && tagReferenceResult.items.length > 0) {
											completionItems = completionItems.concat(tagReferenceResult.items);
										} else {
											completionItems = completionItems.concat(getParameterCompletionItems(tagParameter));
										}

										completionItems = completionItems.concat(ExtensionManager.collectParameterCompletionLists(tagParameter, params));
									}

									if (params.activeParameter.containsInterpolation && params.isInVariableInterpolation && lastScopeItem.isTag) {
										const interpolatedTagRef = TagManager.findTag(lastScopeItem.runtimeName) as IAntlersTag;

										if (interpolatedTagRef.resolveCompletionItems != null) {
											const interpolatedResults = interpolatedTagRef.resolveCompletionItems(params);

											if (interpolatedResults.items.length > 0) {
												completionItems = interpolatedResults.items;
											}
										}
									}
								}
							}
						} else {
							const caretInSymbolOpen = isCursorInsideSymbol(lastScopeItem, params.position);

							params.isCaretInTag = caretInSymbolOpen;
							params.currentSymbol = lastScopeItem;

							const tagManagerResult = TagManager.getCompletionItems(params);

							if (tagManagerResult.isExclusive) {
								completionItems = tagManagerResult.items;
							} else {
								completionItems = completionItems.concat(tagManagerResult.items);
							}
						}
					}
				} else if (params.isInVariableInterpolation && params.currentSymbol == null) {
					completionItems = completionItems.concat(convertScopeToCompletionList(params, lastScopeItem.currentScope.ancestor()));
				}
			}

			if (injectParentScope) {
				completionItems = completionItems.concat(convertScopeToCompletionList(params, lastScopeItem.currentScope));

				const paramDocPath = decodeURIComponent(params.document);

				if (params.project.hasViewCollectionInjections(paramDocPath)) {
					const viewCollectionNames = params.project.getCollectionNamesForView(paramDocPath);

					for (let i = 0; i < viewCollectionNames.length; i++) {
						const blueprintFields = params.project.getBlueprintFields(viewCollectionNames);

						if (blueprintFields.length > 0) {
							for (let j = 0; j < blueprintFields.length; j++) {
								const field = blueprintFields[j];

								completionItems.push({
									label: field.name,
									detail: field.blueprintName,
									documentation: field.instructionText ?? '',
									kind: CompletionItemKind.Field
								});
							}
						}
					}

					ContentVariableNames.forEach((variableName: string) => {
						completionItems.push({
							label: variableName,
							kind: CompletionItemKind.Field
						});
					});
				}
			}

			if (lastScopeItem.manifestType == 'array' && lastScopeItem.isClosedBy != null) {
				const arrayModifiers = ModifierManager.getModifiersForType('array');

				arrayModifiers.forEach((modifier: IModifier) => {
					completionItems.push(makeModifierSuggest(modifier));
				});
			}

			return completionItems;
		}

		for (let i = 0; i < params.symbolsInScope.length; i++) {
			const currentSymbol = params.symbolsInScope[i];
			let shouldProceed = true;

			if (params.isInVariableInterpolation && params.currentSymbol !== null) {
				if (currentSymbol.currentScope != null && params.currentSymbol.currentScope != null &&
					currentSymbol.currentScope.generation > params.currentSymbol.currentScope.generation) {
					shouldProceed = false;
				}
			}

			if (currentSymbol.isTag && shouldProceed) {
				const caretInSymbolOpen = isCursorInsideSymbol(currentSymbol, params.position);

				params.isCaretInTag = caretInSymbolOpen;
				params.currentSymbol = currentSymbol;

				const tagManagerResult = TagManager.getCompletionItems(params);

				if (tagManagerResult.isExclusive) {
					completionItems = tagManagerResult.items;
					break;
				}

				completionItems = completionItems.concat(tagManagerResult.items);
				continue;
			}
		}

		return completionItems;
	}

}
