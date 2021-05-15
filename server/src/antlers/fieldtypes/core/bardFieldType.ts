import { Range } from 'vscode-languageserver-textdocument';
import { CompletionItem, CompletionItemKind, InsertTextFormat, TextEdit } from 'vscode-languageserver-types';
import { IBlueprintField } from '../../../projects/blueprints';
import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { makeIfStatementTree } from '../../builders/ifTreeBuilder';
import { makePartialSetStatements } from '../../builders/partialSetBuilder';
import { Scope } from '../../scope/engine';
import { ISymbol } from '../../types';
import { IFieldtypeInjection } from '../fieldtypeManager';

const BardFieldType: IFieldtypeInjection = {
	name: 'bard',
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		scope.addVariable({ name: 'type', dataType: 'string', sourceField: null, sourceName: '*internal.bard', introducedBy: symbol });
	},
	injectCompletions: (params: ISuggestionRequest, blueprintField: IBlueprintField, symbol: ISymbol) => {
		const items: CompletionItem[] = [];

		return items;

		/*if (blueprintField.sets != null && blueprintField.sets.length > 0) {
			const setNames: string[] = [],
				range: Range = {
					start: {
						line: params.position.line,
						character: params.position.character - params.originalLeftWord.length
					},
					end: params.position
				};

			for (let i = 0; i < blueprintField.sets.length; i++) {
				setNames.push(blueprintField.sets[i].handle);
			}

			const partialTypeSnippet = makePartialSetStatements(setNames),
				bardTypeSnippet = makeIfStatementTree({ variableName: 'type', checkTerms: setNames });

			items.push({
				label: 'bard fields',
				detail: 'Generates if statements for each set.',
				insertTextFormat: InsertTextFormat.Snippet,
				kind: CompletionItemKind.Snippet,
				textEdit: TextEdit.replace(range, bardTypeSnippet),
				command: {
					title: 'Suggest',
					command: 'editor.action.triggerSuggest'
				}
			});

			items.push({
				label: 'bard partial fields',
				detail: 'Generates partial tags for each set.',
				insertTextFormat: InsertTextFormat.Snippet,
				kind: CompletionItemKind.Snippet,
				textEdit: TextEdit.replace(range, partialTypeSnippet),
				command: {
					title: 'Suggest',
					command: 'editor.action.triggerSuggest'
				}
			});
		}

		return items;*/
	}
};

export default BardFieldType;
