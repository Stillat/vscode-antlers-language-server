import { CompletionItem } from 'vscode-languageserver';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { tagToCompletionItem } from '../../../documentedLabel';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag } from '../../../tagManager';
import CookieForget from './cookieForget';
import CookieHas from './cookieHas';
import CookieSet from './cookieSet';
import CookieValue from './cookieValue';

const CookieCompletions: CompletionItem[] = [
    tagToCompletionItem(CookieForget),
    tagToCompletionItem(CookieValue),
    tagToCompletionItem(CookieSet),
    tagToCompletionItem(CookieHas),
];

const CookieTag: IAntlersTag = {
    tagName: 'cookie',
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: false,
    hideFromCompletions: false,
    injectParentScope: false,
    introducedIn: '3.3.38',
    parameters: [],
    resolveCompletionItems: (params: ISuggestionRequest) => {
        if (
            (params.leftWord == "cookie" || params.leftWord == "/cookie") &&
            params.leftChar == ":"
        ) {
            return exclusiveResult(CookieCompletions);
        }

        return EmptyCompletionResult;
    }
}

export default CookieTag;
