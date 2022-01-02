import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';

const LanguageConstructs: CompletionItem[] = [
    { label: 'if', kind: CompletionItemKind.Keyword },
    { label: 'elseif', kind: CompletionItemKind.Keyword },
    { label: 'else', kind: CompletionItemKind.Keyword },
];

export default LanguageConstructs;
