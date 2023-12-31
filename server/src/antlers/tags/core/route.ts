import { makeTagDoc } from '../../../documentation/utils.js';
import { getRouteCompletions } from '../../../suggestions/project/routeCompletions.js';
import { getCurrentSymbolMethodNameValue } from '../../../suggestions/suggestionManager.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag, ICompletionResult } from '../../tagManager.js';
import { returnDynamicParameter } from '../dynamicParameterResolver.js';

const Route: IAntlersTag = {
    tagName: 'route',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: true,
    allowsContentClose: false,
    parameters: [],
    introducedIn: null,
    resolveDynamicParameter: returnDynamicParameter,
    resolveCompletionItems: (params: ISuggestionRequest): ICompletionResult => {
        if (params.leftMeaningfulWord == 'route') {
            const existingRouteValue = getCurrentSymbolMethodNameValue(params);

            return exclusiveResult(getRouteCompletions(existingRouteValue, params.project));
        }

        return EmptyCompletionResult;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'route Tag',
            'The `route` tag can be used to generate a full URL [to a named route](https://laravel.com/docs/8.x/routing#named-routes), including any defined route parameters.',
            'https://statamic.dev/tags/route'
        );
    }
};

export default Route;
