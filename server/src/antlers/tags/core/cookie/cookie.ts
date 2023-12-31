import { CompletionItem } from 'vscode-languageserver';;
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { tagToCompletionItem } from '../../../documentedLabel.js';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag } from '../../../tagManager.js';
import CookieForget from './cookieForget.js';
import CookieHas from './cookieHas.js';
import CookieSet from './cookieSet.js';
import CookieValue from './cookieValue.js';

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
