import { CompletionItem, CompletionItemKind, MarkupKind } from 'vscode-languageserver-types';
import { IModifier } from '../antlers/modifierManager';
import { IBlueprintField } from '../projects/blueprints';

export function makeFieldSuggest(name: string, description: string, valueType: string): CompletionItem {
	const item: CompletionItem = {
		label: name,
		insertText: name,
		kind: CompletionItemKind.Field,
		detail: valueType + ': ' + description
	};

	return item;
}

export function makeModifierSuggest(modifier: IModifier): CompletionItem {
	let helpContent = modifier.description;

	if (modifier.docLink != null && modifier.docLink.trim().length > 0) {
		helpContent += ' [' + modifier.docLink + '](' + modifier.docLink + ')';
	}

	const item: CompletionItem = {
		label: modifier.name,
		insertText: modifier.name,

		documentation: {
			kind: MarkupKind.Markdown,
			value: helpContent
		},
		kind: CompletionItemKind.Function,
	};

	return item;
}

export function makeParameterSuggest(name: string): CompletionItem {
	return {
		label: '"' + name + '"',
		insertText: name,
		kind: CompletionItemKind.Text
	};
}

export function makeValueSuggestion(name: string, description: string, valueType: string): CompletionItem {
	const item: CompletionItem = {
		label: name,
		insertText: name,
		kind: CompletionItemKind.Value,
		detail: valueType + ': ' + description
	};

	return item;
}

export function formatSuggestionList(fields: IBlueprintField[]): CompletionItem[] {
	const items: CompletionItem[] = [];

	for (let i = 0; i < fields.length; i++) {
		if (typeof fields[i].name === 'undefined') {
			continue;
		}

		items.push(formatSuggestion(fields[i]));
	}

	return items;
}

export function formatSuggestion(field: IBlueprintField): CompletionItem {
	let detail = '';
	let displayName = field.name;

	if (field.instructionText != null) {
		detail = field.instructionText;
	}

	if (field.displayName != null) {
		displayName = field.displayName + ' (' + field.name + ')';
	}

	if (field.blueprintName != null) {
		if (detail.trim().length > 0) {
			detail += "\n";
		}

		detail += 'Blueprint: ' + field.blueprintName;
	}

	if (field.type != null) {
		displayName += ': ' + field.type;
	}

	return {
		label: field.name,
		insertText: field.name,
		kind: CompletionItemKind.Field,
		documentation: detail,
		detail: displayName
	};
}
