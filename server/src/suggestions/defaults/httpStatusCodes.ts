import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';

const RedirectStatusCodes: CompletionItem[] = [
    { label: '301 Permanent', insertText: '301', kind: CompletionItemKind.EnumMember },
    { label: '302 Temporary', insertText: '302', kind: CompletionItemKind.EnumMember },
    { label: '404 Not Found', insertText: '404', kind: CompletionItemKind.EnumMember },
];

export { RedirectStatusCodes };
