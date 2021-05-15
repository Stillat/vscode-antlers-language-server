import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';

const FormHttpVerbCompletions: CompletionItem[] = [
	{ label: 'GET', kind: CompletionItemKind.EnumMember },
	{ label: 'POST', kind: CompletionItemKind.EnumMember },
];

export default FormHttpVerbCompletions;
