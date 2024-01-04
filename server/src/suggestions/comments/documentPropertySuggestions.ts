import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

const DocumentPropertySuggestions: CompletionItem[] = [
    { label: 'name', kind: CompletionItemKind.Property },
    { label: 'description', kind: CompletionItemKind.Property },
    { label: 'desc', kind: CompletionItemKind.Property },
    { label: 'entry', kind: CompletionItemKind.Property },
    { label: 'collection', kind: CompletionItemKind.Property },
    { label: 'blueprint', kind: CompletionItemKind.Property },
    { label: 'var', kind: CompletionItemKind.Property },
    { label: 'set', kind: CompletionItemKind.Property },
    { label: 'param', kind: CompletionItemKind.Property },
    { label: 'param*', kind: CompletionItemKind.Property },
    { label: 'front', kind: CompletionItemKind.Property },
    { label: 'format', kind: CompletionItemKind.Property }
];

export { DocumentPropertySuggestions };
