import { CompletionItem } from 'vscode-languageserver-types';
import { ISuggestionRequest } from '../suggestionManager';
import CollectionSnippet from './antlers/collection';
import CopyrightYearSnippet from './antlers/copyrightYear';
import FormsetSnippet from './antlers/formset';
import NavDepthTwoSnippet from './antlers/navDepthTwo';
import { getGenericAntlersSnippets } from './genericSnippets';

export class SnippetsManager {
	static registeredSnippets: Map<string, string> = new Map();

	static loadCoreSnippets() {
		this.registeredSnippets.set('collection', CollectionSnippet);
		this.registeredSnippets.set('formset', FormsetSnippet);
		this.registeredSnippets.set('nav_depth2', NavDepthTwoSnippet);
		this.registeredSnippets.set('copyright_year', CopyrightYearSnippet);
	}

	static getContent(name: string): string {
		if (this.registeredSnippets.has(name)) {
			return this.registeredSnippets.get(name) as string;
		}

		return '';
	}

	static getSnippets(params: ISuggestionRequest): CompletionItem[] {
		let items: CompletionItem[] = [];

		items = items.concat(getGenericAntlersSnippets(params));

		return items;
	}

}
