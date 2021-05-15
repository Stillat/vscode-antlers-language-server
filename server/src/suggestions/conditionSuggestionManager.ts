import { CompletionItem, CompletionItemKind, CompletionList } from 'vscode-languageserver-types';
import { ConditionAnalyzer } from '../antlers/conditionAnalyzer';
import { ConditionalTokenType, ConditionParser } from '../antlers/conditionParser';
import { ConditionSearcher, isOperandContextEmpty } from '../antlers/conditionSearcher';
import { Scope, IScopeVariable } from '../antlers/scope/engine';
import { exclusiveResult, TagManager } from '../antlers/tagManager';
import { ISymbol } from '../antlers/types';
import { trimLeft, trimRight } from '../utils/strings';
import { ConditionalTypeSuggestionsManager } from './conditionalTypeSuggestionsManager';
import { makeFieldSuggest } from './fieldFormatter';
import { convertScopeToCompletionList, getModifierCompletionList, ISuggestionRequest, shouldHandleModifierScopeInjections } from './suggestionManager';

export interface IContentOffset {
	content: string,
	offset: number
}

export function getConditionInnerContent(symbol: ISymbol): IContentOffset {
	let content = symbol.content,
		origLen = content.length,
		startOffset = 0;

	content = trimLeft(content, '{');

	startOffset += (origLen - content.length);
	origLen = content.length;

	content = trimLeft(content, ' ');
	startOffset += (origLen - content.length);
	origLen = content.length;

	content = trimLeft(content, symbol.name);
	startOffset += (origLen - content.length);
	origLen = content.length;

	content = trimLeft(content, ' ');
	startOffset += (origLen - content.length);
	origLen = content.length;

	content = trimRight(content, '}');
	content = content.trim();

	return {
		content: content,
		offset: startOffset
	};
}

export class ConditionalSuggestionManager {

	static resolveConditionalCompletions(params: ISuggestionRequest, symbol: ISymbol): CompletionItem[] {
		const conditionalParser = new ConditionParser(),
			conditionalAnalyzer = new ConditionAnalyzer(),
			contentOffset = getConditionInnerContent(symbol);
		let items: CompletionItem[] = [],
			addScopeToList = false,
			addTagsToList = false,
			isInString = false;

		conditionalParser.setStartOffset(symbol.startLine, contentOffset.offset + symbol.startOffset);
		conditionalParser.parseText(contentOffset.content);

		const conditionSearch = new ConditionSearcher(),
			analyzedTokens = conditionalAnalyzer.analyze(symbol, conditionalParser.getTokens());

		conditionSearch.setTokens(analyzedTokens);

		if (conditionSearch.isInString(params.position)) {
			addScopeToList = false;
			addTagsToList = false;
			isInString = true;
		} else {
			addScopeToList = true;
			addTagsToList = false;
		}

		if (conditionSearch.isInTagExpression(params.position)) {
			const expression = conditionSearch.getLastToken();

			addScopeToList = true;
			addTagsToList = true;

			if (params.leftChar == ':' && expression != null) {
				let adjustName = expression.content;

				adjustName = trimLeft(adjustName, '{');
				adjustName = trimRight(adjustName, '}');
				adjustName = trimRight(adjustName, ':');

				if (TagManager.isKnownTag(adjustName)) {
					const tagRef = TagManager.findTag(adjustName);

					if (typeof tagRef !== 'undefined' && tagRef !== null && tagRef.resolveCompletionItems != null) {
						const result = tagRef.resolveCompletionItems(params);

						if (result.items.length > 0) {
							if (result.isExclusiveResult) {
								return result.items;
							} else {
								items = items.concat(result.items);
							}
						} else {
							return [];
						}
					}
				}
			}
		} else if (isInString) {
			const activeStringLiteral = conditionSearch.getActiveToken(params.position);

			if (activeStringLiteral != null) {
				const currentContext = conditionSearch.getActiveOperandContext();

				if (!isOperandContextEmpty(currentContext)) {
					if (currentContext.leftOperand != null && currentContext.leftOperand.content == 'collection') {
						const collections = params.project.getUniqueCollectionNames();

						for (let i = 0; i < collections.length; i++) {
							items.push({
								label: collections[i],
								kind: CompletionItemKind.Variable
							});
						}
					}

					if (currentContext.operator?.type == ConditionalTokenType.EqualityComparison &&
						currentContext.leftOperand?.context != null &&
						currentContext.leftOperand.context.reference != null) {
						return ConditionalTypeSuggestionsManager.getCompletionItems(params, currentContext);
					}
				}
			}
		}

		if (addTagsToList) {
			const allTagNames = TagManager.getVisibleTagNames();

			for (let i = 0; i < allTagNames.length; i++) {
				if (allTagNames[i].includes(':') == false) {
					items.push({
						label: allTagNames[i],
						kind: CompletionItemKind.Text
					});
				}
			}
		}

		if (addScopeToList) {
			const lastScopeItem = params.symbolsInScope[params.symbolsInScope.length - 1];

			if (lastScopeItem != null) {
				if (lastScopeItem.currentScope != null) {
					if (conditionSearch.isRightOfModifier(params.position)) {
						const lastToken = conditionSearch.getLastToken();

						if (lastToken != null && lastToken.type == ConditionalTokenType.ModifierTrigger) {
							return getModifierCompletionList();
						} else if (shouldHandleModifierScopeInjections(params, lastScopeItem)) {
							return getModifierCompletionList();
						}
					}

					if (params.leftChar == ':' && lastScopeItem.currentScope.containsPath(params.leftWord)) {
						const specificScope = lastScopeItem.currentScope.findNestedScope(params.leftWord);

						if (specificScope != null) {
							items = [];

							specificScope.lists.forEach((val: Scope, key: string) => {
								items.push(makeFieldSuggest(key, '', ''));
							});
							specificScope.values.forEach((val: IScopeVariable) => {
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
							});

							return items;
						}
					}

					items = items.concat(convertScopeToCompletionList(params, lastScopeItem.currentScope));
				}
			}
		}

		return items;
	}

}
