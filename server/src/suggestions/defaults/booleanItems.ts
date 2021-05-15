import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';

const BooleanCompletionItems: CompletionItem[] = [];

BooleanCompletionItems.push({ label: 'true', kind: CompletionItemKind.Keyword });
BooleanCompletionItems.push({ label: 'false', kind: CompletionItemKind.Keyword });

export { BooleanCompletionItems };
