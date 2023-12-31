import { makeTagDoc } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { EmptyCompletionResult, exclusiveResult, IAntlersParameter, IAntlersTag, ICompletionResult } from '../../tagManager.js';
import { getAllRolesSuggestions, makeUserRolesSuggestions } from './user/permissionUtils.js';

const Is: IAntlersTag = {
    tagName: 'is',
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
            aliases: ['roles'],
            allowsVariableReference: false,
            name: 'role',
            description: 'The roles to check against.',
            expectsTypes: ['string', 'array'],
            isDynamic: false
        }
    ],
    resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
        if (parameter.name == 'roles' || parameter.name == 'role') {
            if (params.context?.parameterContext != null) {
                return exclusiveResult(makeUserRolesSuggestions(params.context.parameterContext.parameter?.getArrayValue() ?? [], params.project));

            }
        }

        return null;
    },
    resolveCompletionItems: (params: ISuggestionRequest): ICompletionResult => {
        if ((params.leftWord == 'is' || params.leftWord == '/is') && params.leftChar == ':') {
            return exclusiveResult(getAllRolesSuggestions(params.project));
        }

        return EmptyCompletionResult;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'is Tag',
            'The `is` tag can be used to check whether the currently authenticated user has one or more roles. This tag behaves the same as the `user:is` tag.',
            'https://statamic.dev/tags/user-is'
        );
    }
};

export default Is;
