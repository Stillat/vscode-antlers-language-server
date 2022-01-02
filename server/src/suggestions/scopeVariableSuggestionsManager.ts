import { CompletionItem } from "vscode-languageserver-types";
import FieldtypeManager from '../antlers/fieldtypes/fieldtypeManager';
import { IFieldtypeInjection } from '../projects/fieldsets/fieldtypeInjection';
import { AntlersNode } from '../runtime/nodes/abstractNode';
import { ISuggestionRequest } from './suggestionRequest';

export class ScopeVariableSuggestionsManager {
    static getVariableSuggestions(params: ISuggestionRequest, symbol: AntlersNode): CompletionItem[] {
        let items: CompletionItem[] = [];

        if (symbol.scopeVariable != null && symbol.scopeVariable.sourceField != null) {
            if (FieldtypeManager.instance?.hasFieldtype(symbol.scopeVariable.sourceField.type)) {
                const fieldTypeRef = FieldtypeManager.instance?.getFieldType(
                    symbol.scopeVariable.sourceField.type
                ) as IFieldtypeInjection;

                if (fieldTypeRef.injectCompletions != null) {
                    items = fieldTypeRef.injectCompletions(
                        params,
                        symbol.scopeVariable.sourceField,
                        symbol
                    );
                }
            }
        }

        return items;
    }
}
