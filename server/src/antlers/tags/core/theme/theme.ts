import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { EmptyCompletionResult, exclusiveResult, IAntlersParameter, IAntlersTag } from '../../../tagManager.js';
import { ThemePathParameters } from './themeParameters.js';

const ThemeTagCompletionItems: CompletionItem[] = [
    { label: 'asset', kind: CompletionItemKind.Text },
    { label: 'css', kind: CompletionItemKind.Text },
    { label: 'img', kind: CompletionItemKind.Text },
    { label: 'js', kind: CompletionItemKind.Text },
    { label: 'output', kind: CompletionItemKind.Text },
    { label: 'path', kind: CompletionItemKind.Text },
];

const Theme: IAntlersTag = {
    tagName: 'theme',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: false,
    introducedIn: null,
    injectParentScope: false,
    parameters: ThemePathParameters,
    resolveCompletionItems: (params: ISuggestionRequest) => {
        if (params.isPastTagPart == false && (params.leftWord == 'theme' || params.leftWord == '/theme') && params.leftChar == ':') {
            return exclusiveResult(ThemeTagCompletionItems);
        }

        return EmptyCompletionResult;
    }
};

export default Theme;
