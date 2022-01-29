import { makeTagDoc } from '../../../documentation/utils';
import { RedirectStatusCodes } from '../../../suggestions/defaults/httpStatusCodes';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { EmptyCompletionResult, exclusiveResult, IAntlersParameter, IAntlersTag } from '../../tagManager';

const Redirect: IAntlersTag = {
    tagName: 'redirect',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
	introducedIn: null,
    parameters: [{
        name: 'to',
        description: 'The destination URL',
        aliases: ['url'],
        allowsVariableReference: false,
        acceptsVariableInterpolation: false,
        expectsTypes: ['string'],
        isDynamic: false,
        isRequired: true
    }, {
        name: 'response',
        description: 'The HTTP response code to use',
        acceptsVariableInterpolation: false,
        aliases: [],
        allowsVariableReference: false,
        expectsTypes: ['number'],
        isDynamic: false,
        isRequired: false
    }],
    resovleParameterCompletionItems: (parameter: IAntlersParameter) => {
        if (parameter.name == 'response') {
            return exclusiveResult(RedirectStatusCodes);
        }

        return EmptyCompletionResult;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'redirect Tag',
            'The `redirect` tag can be used to redirect the site visitor to a URL or named route. An optional HTTP status code can also be specified on the response using the `response` parameter.',
            'https://statamic.dev/tags/redirect'
        );
    }
};

export default Redirect;
