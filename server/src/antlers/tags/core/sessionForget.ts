import { makeTagDoc } from '../../../documentation/utils';
import SessionVariableManager from '../../../references/sessionVariableManager';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { getUniqueParameterArrayValuesSuggestions } from '../../../suggestions/uniqueParameterArraySuggestions';
import { IAntlersParameter, IAntlersTag } from '../../tagManager';

const SessionForget: IAntlersTag = {
    tagName: 'session:forget',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    parameters: [
        {
            name: 'keys',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            description: 'The session keys to clear',
            expectsTypes: ['string'],
            isRequired: true,
            isDynamic: false
        }
    ],
    resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
        if (parameter.name == 'keys' && params.context?.parameterContext != null) {
            const existingVarNames = SessionVariableManager.instance?.getKnownSessionVariableNames() ?? [];

            if (params.context.parameterContext.parameter != null) {
                return getUniqueParameterArrayValuesSuggestions(params.context.parameterContext.parameter, existingVarNames);
            }
        }

        return null;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'session:forget Tag',
            'The `session:forget` tag is used to remove variables from the user\'s session.',
            'https://statamic.dev/tags/session-forget'
        );
    }
};

export default SessionForget;
