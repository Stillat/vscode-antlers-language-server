import { SessionVariableManager } from '../../../references/sessionVariableManager';
import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { getUniqueParameterArrayValuesSuggestions } from '../../../suggestions/uniqueParameterArraySuggestions';
import { exclusiveResult, IAntlersParameter, IAntlersTag, ICompletionResult } from '../../tagManager';

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
		if (parameter.name == 'keys' && params.activeParameter != null) {
			const existingVarNames = SessionVariableManager.getKnownSessionVariableNames();

			return getUniqueParameterArrayValuesSuggestions(params.activeParameter, existingVarNames);
		}

		return null;
	}
};

export default SessionForget;
