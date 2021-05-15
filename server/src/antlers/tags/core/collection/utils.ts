import { Range } from 'vscode-languageserver-textdocument';
import { CompletionItem, CompletionItemKind, InsertTextFormat, TextEdit } from 'vscode-languageserver-types';
import { excludeNameRegex } from '../../../../patterns';
import { IBlueprintField } from '../../../../projects/blueprints';
import { StatamicProject } from '../../../../projects/statamicProject';
import { ISuggestionRequest } from '../../../../suggestions/suggestionManager';
import { getTrimmedMatch } from '../../../../utils/strings';
import { Scope } from '../../../scope/engine';
import { ISymbol, ICollectionContext } from '../../../types';
import { EntryStatuses } from './parameters';

export function getExcludeCollectionName(symbol: ISymbol): string | null {
	if (!symbol.isClosingTag) {
		const excludeCollections = getTrimmedMatch(excludeNameRegex, symbol.content, 1);

		if (excludeCollections != null) {
			return excludeCollections;
		}
	}

	return null;
}

export function getTaxonomyCompletionItems(request: ISuggestionRequest): CompletionItem[] {
	const items: CompletionItem[] = [];

	if (request.project != null) {
		const range: Range = {
			start: {
				line: request.position.line,
				character: request.position.character - request.originalLeftWord.length
			},
			end: request.position
		};

		const taxonomyNames = request.project.getUniqueTaxonomyNames();

		for (let i = 0; i < taxonomyNames.length; i++) {
			const taxonomyName = taxonomyNames[i];
			const snippet = request.originalLeftWord + taxonomyName + '="$1"';

			items.push({
				label: request.originalLeftWord + taxonomyName,
				insertTextFormat: InsertTextFormat.Snippet,
				kind: CompletionItemKind.Field,
				textEdit: TextEdit.replace(range, snippet),
				command: {
					title: 'Suggest',
					command: 'editor.action.triggerSuggest'
				}
			});
		}
	}

	return items;
}

export function getCollectionBlueprintFields(symbol: ISymbol, scope: Scope): IBlueprintField[] {
	let fields: IBlueprintField[] = [];

	if (symbol.reference != null) {
		const collectionSymbol = symbol.reference as ICollectionContext,
			symbolFields = scope.statamicProject.getBlueprintFields(collectionSymbol.collectionNames);

		if (typeof symbolFields !== 'undefined' && symbolFields != null) {
			fields = symbolFields;
		}
	}

	return fields;
}

export function makeStatusSuggestions(existingValues: string[]): CompletionItem[] {
	const items: CompletionItem[] = [],
		validStatuses = EntryStatuses.filter(e => !existingValues.includes(e));

	for (let i = 0; i < validStatuses.length; i++) {
		items.push({
			label: validStatuses[i],
			kind: CompletionItemKind.Variable
		});
	}

	return items;
}

export function makeTaxonomySuggestions(existingValues: string[], taxonomyName: string, project: StatamicProject): CompletionItem[] {
	const items: CompletionItem[] = [],
		taxonomyTerms = project.getTaxonomyTerms(taxonomyName),
		termsToReturn = taxonomyTerms.filter(e => !existingValues.includes(e));

	for (let i = 0; i < termsToReturn.length; i++) {
		items.push({
			label: termsToReturn[i],
			kind: CompletionItemKind.Variable
		});
	}

	return items;
}

export function makeSingleCollectionNameSuggestions(project: StatamicProject): CompletionItem[] {
	const items: CompletionItem[] = [],
		collectionNames = project.collectionNames;

	for (let i = 0; i < collectionNames.length; i++) {
		items.push({
			label: collectionNames[i],
			kind: CompletionItemKind.Variable
		});
	}

	return items;
}

export function makeCollectionNameSuggestions(existingValues: string[], project: StatamicProject): CompletionItem[] {
	const items: CompletionItem[] = [],
		collectionNames = project.collectionNames.filter(e => !existingValues.includes(e));

	for (let i = 0; i < collectionNames.length; i++) {
		items.push({
			label: collectionNames[i],
			kind: CompletionItemKind.Variable
		});
	}

	return items;
}

export function makeQueryScopeSuggestions(project: StatamicProject): CompletionItem[] {
	const items: CompletionItem[] = [];

	const queryScopes = project.getCollectionQueryScopes();

	for (let i = 0; i < queryScopes.length; i++) {
		items.push({
			label: queryScopes[i].name,
			detail: queryScopes[i].description,
			kind: CompletionItemKind.Variable
		});
	}

	return items;
}
