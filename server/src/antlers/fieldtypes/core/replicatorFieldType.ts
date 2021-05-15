import { CompletionItem, InsertTextFormat, CompletionItemKind, TextEdit } from 'vscode-languageserver';
import { Range } from 'vscode-languageserver-textdocument';
import { IBlueprintField } from '../../../projects/blueprints';
import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { makeIfStatementTree } from '../../builders/ifTreeBuilder';
import { makePartialSetStatements } from '../../builders/partialSetBuilder';
import { Scope } from '../../scope/engine';
import { ISymbol } from '../../types';
import { makeLoopVariables } from '../../variables/loopVariables';
import { makeReplicatorVariables } from '../../variables/replicatorVariables';
import { IFieldtypeInjection } from '../fieldtypeManager';

const ReplicatorFieldtype: IFieldtypeInjection = {
	name: 'replicator',
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		scope.addVariables(makeReplicatorVariables(symbol));
		scope.addVariables(makeLoopVariables(symbol));
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

			const replicatorPartialTypeSnippet = makePartialSetStatements(setNames),
				replicatorTypeSnippet = makeIfStatementTree({ variableName: 'type', checkTerms: setNames });

			items.push({
				label: 'replicator fields',
				detail: 'Generates if statements for each set.',
				insertTextFormat: InsertTextFormat.Snippet,
				kind: CompletionItemKind.Snippet,
				textEdit: TextEdit.replace(range, replicatorTypeSnippet),
				command: {
					title: 'Suggest',
					command: 'editor.action.triggerSuggest'
				}
			});

			items.push({
				label: 'replicator partial fields',
				detail: 'Generates partial tags for each set.',
				insertTextFormat: InsertTextFormat.Snippet,
				kind: CompletionItemKind.Snippet,
				textEdit: TextEdit.replace(range, replicatorPartialTypeSnippet),
				command: {
					title: 'Suggest',
					command: 'editor.action.triggerSuggest'
				}
			});
		}

		return items;*/
	}
};

export default ReplicatorFieldtype;
