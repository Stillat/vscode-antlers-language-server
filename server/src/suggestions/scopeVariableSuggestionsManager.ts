import { CompletionItem } from 'vscode-languageserver-types';
import { FieldtypeManager, IFieldtypeInjection } from '../antlers/fieldtypes/fieldtypeManager';
import { ISymbol } from '../antlers/types';
import { ISuggestionRequest } from './suggestionManager';

export class ScopeVariableSuggestionsManager {

	static getVariableSuggestions(params: ISuggestionRequest, symbol: ISymbol): CompletionItem[] {
		let items: CompletionItem[] = [];

		if (symbol.scopeVariable != null && symbol.scopeVariable.sourceField != null) {
			if (FieldtypeManager.hasFieldtype(symbol.scopeVariable.sourceField.type)) {
				const fieldTypeRef = FieldtypeManager.fieldTypes.get(symbol.scopeVariable.sourceField.type) as IFieldtypeInjection;

				if (fieldTypeRef.injectCompletions != null) {
					items = fieldTypeRef.injectCompletions(params, symbol.scopeVariable.sourceField, symbol);
				}
			}

		}

		return items;
	}

}
