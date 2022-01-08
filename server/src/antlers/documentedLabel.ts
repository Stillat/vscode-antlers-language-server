import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { IAntlersTag } from './tagManager';

export interface IDocumentedLabel {
    label: string;
    documentation: string;
}

export function tagToCompletionItem(tag: IAntlersTag): CompletionItem {
    let docs = '';

    if (typeof tag !== 'undefined' && typeof tag.resolveDocumentation !== 'undefined' && tag.resolveDocumentation != null) {
        docs = tag.resolveDocumentation();
    }

    let completionLabel = tag.tagName;

    if (completionLabel.includes(':')) {
        const parts = completionLabel.split(':');

        completionLabel = parts[parts.length - 1];
    }

    return {
        label: completionLabel,
        kind: CompletionItemKind.Text,
        sortText: '1',
        documentation: {
            kind: 'markdown',
            value: docs
        }
    };
}
