import { makeTagDoc } from '../../../documentation/utils';
import { getRouteCompletions } from '../../../suggestions/project/routeCompletions';
import { getCurrentSymbolMethodNameValue } from '../../../suggestions/suggestionManager';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag, ICompletionResult } from '../../tagManager';
import { returnDynamicParameter } from '../dynamicParameterResolver';

const Route: IAntlersTag = {
    tagName: 'route',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: true,
    allowsContentClose: false,
    parameters: [],
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
