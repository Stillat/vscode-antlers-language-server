import { Range } from 'vscode-languageserver-textdocument';
import { CompletionItem, CompletionItemKind, InsertTextFormat, TextEdit } from 'vscode-languageserver-types';
import { ISuggestionRequest } from '../suggestionManager';
import { SnippetsManager } from './snippetsManager';

function makeSnippet(name: string, description: string, content: string, range: Range): CompletionItem {
	return {
		label: name,
		detail: description,
		insertTextFormat: InsertTextFormat.Snippet,
		kind: CompletionItemKind.Snippet,
		textEdit: TextEdit.replace(range, content),
		command: {
			title: 'Suggest',
			command: 'editor.action.triggerSuggest'
		}
	};
}

export function getGenericAntlersSnippets(params: ISuggestionRequest): CompletionItem[] {
	const items: CompletionItem[] = [];

	const range: Range = {
		start: {
			line: params.position.line,
			character: params.position.character - params.originalLeftWord.length
		},
		end: params.position
	};

	const collectionSnippet = SnippetsManager.getContent('collection'),
		forms = SnippetsManager.getContent('formset'),
		navDepth2 = SnippetsManager.getContent('nav_depth2'),
		copyrightYear = SnippetsManager.getContent('copyright_year');

	if (collectionSnippet != null) {
		items.push(makeSnippet('coll', 'Statamic Collection', collectionSnippet, range));
	}

	if (forms != null) {
		items.push(makeSnippet('formset', 'Statamic Form Set', forms, range));
	}

	if (navDepth2 != null) {
		items.push(makeSnippet('nav-depth2', 'Statamic Nav with Depth Two', navDepth2, range));
	}

	if (copyrightYear != null) {
		items.push(makeSnippet('copyright_year', 'Copyright year using Antlers tags.', copyrightYear, range));
	}

	return items;
}
