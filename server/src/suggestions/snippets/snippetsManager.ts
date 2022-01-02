import { Range, InsertTextFormat, CompletionItemKind, TextEdit } from 'vscode-languageserver';
import { CompletionItem } from "vscode-languageserver-types";
import { ISuggestionRequest } from '../suggestionRequest';
import CollectionSnippet from "./antlers/collection";
import CopyrightYearSnippet from "./antlers/copyrightYear";
import FormsetSnippet from "./antlers/formset";
import { GenericLocalesSnippet } from "./antlers/multisite/languagePicker";
import NavDepthTwoSnippet from "./antlers/navDepthTwo";

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

function getGenericAntlersSnippets(params: ISuggestionRequest): CompletionItem[] {
	const items: CompletionItem[] = [];

	const range: Range = {
		start: {
			line: params.position.line,
			character: params.position.character - params.originalLeftWord.length
		},
		end: params.position
	};

	const collectionSnippet = SnippetsManager.instance?.getContent('collection'),
		forms = SnippetsManager.instance?.getContent('formset'),
		navDepth2 = SnippetsManager.instance?.getContent('nav_depth2'),
		copyrightYear = SnippetsManager.instance?.getContent('copyright_year'),
		multiSiteGenericLocales = SnippetsManager.instance?.getContent('multisite_lang_generic');

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

	if (multiSiteGenericLocales != null) {
		items.push(makeSnippet('multisite_locales', 'Displays the current locale, and a list of all available locales.', multiSiteGenericLocales, range));
	}

	return items;
}


class SnippetsManager {
	private registeredSnippets: Map<string, string> = new Map();

	public static instance: SnippetsManager | null = null;

	loadCoreSnippets() {
		this.registeredSnippets.set("collection", CollectionSnippet);
		this.registeredSnippets.set("formset", FormsetSnippet);
		this.registeredSnippets.set("nav_depth2", NavDepthTwoSnippet);
		this.registeredSnippets.set("copyright_year", CopyrightYearSnippet);

		this.registeredSnippets.set(
			"multisite_lang_generic",
			GenericLocalesSnippet
		);
	}

	getContent(name: string): string {
		if (this.registeredSnippets.has(name)) {
			return this.registeredSnippets.get(name) as string;
		}

		return "";
	}

	getSnippets(params: ISuggestionRequest | null): CompletionItem[] {
		let items: CompletionItem[] = [];

		if (params == null) {
			return items;
		}

		items = items.concat(getGenericAntlersSnippets(params));

		return items;
	}
}

if (
	typeof SnippetsManager.instance == "undefined" ||
	SnippetsManager.instance == null
) {
	SnippetsManager.instance = new SnippetsManager();
	SnippetsManager.instance.loadCoreSnippets();
}

export default SnippetsManager;
