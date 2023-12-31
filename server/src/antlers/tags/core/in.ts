import { makeTagDoc } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { EmptyCompletionResult, exclusiveResult, IAntlersParameter, IAntlersTag, ICompletionResult } from '../../tagManager.js';
import { getAllGroupSuggestionsn, makeUserGroupSuggestions } from './user/permissionUtils.js';

const In: IAntlersTag = {
    tagName: 'in',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    injectParentScope: false,
    introducedIn: null,
    parameters: [
        {
            isRequired: true,
            acceptsVariableInterpolation: false,
            aliases: ['groups'],
            allowsVariableReference: false,
            name: 'group',
            description: 'The groups to check against',
            expectsTypes: ['string', 'array'],
            isDynamic: false
        }
    ],
    resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
        if (parameter.name == 'groups' || parameter.name == 'group') {
            if (params.context?.parameterContext != null) {
                return exclusiveResult(makeUserGroupSuggestions(params.context.parameterContext.parameter?.getArrayValue() ?? [], params.project));
            }
        }

        return null;
    },
    resolveCompletionItems: (params: ISuggestionRequest): ICompletionResult => {
        if ((params.leftWord == 'in' || params.leftWord == '/in') && params.leftChar == ':') {
            return exclusiveResult(getAllGroupSuggestionsn(params.project));
        }

        return EmptyCompletionResult;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'in Tag',
            'The `in` tag can be used to check if the authenticated user belongs to one or more groups. This tag operates similarly to the `user:in` tag.',
            'https://statamic.dev/tags/user-in'
        );
    }
};

export default In;
