import { CompletionItem } from 'vscode-languageserver-types';
import { makeTagDoc } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { tagToCompletionItem } from '../../documentedLabel.js';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag } from '../../tagManager.js';
import MarkdownIndent from './markdownIndent.js';

const MarkdownCompletionItems: CompletionItem[] = [
    tagToCompletionItem(MarkdownIndent)
];

const Markdown: IAntlersTag = {
    tagName: 'markdown',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: true,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    introducedIn: null,
    parameters: [],
    resolveCompletionItems: (params: ISuggestionRequest) => {
        if (params.isPastTagPart == false && (params.leftWord == 'markdown' || params.leftWord == '/markdown') && params.leftChar == ':') {
            return exclusiveResult(MarkdownCompletionItems);
        }

        return EmptyCompletionResult;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'markdown Tag',
            'The `markdown` tag can be used to render the tags contents as markdown.',
            'https://statamic.dev/tags/markdown'
        );
    }
};

export default Markdown;
