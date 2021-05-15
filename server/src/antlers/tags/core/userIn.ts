import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { exclusiveResult, IAntlersParameter, IAntlersTag } from '../../tagManager';
import { getParameterArrayValue } from './../parameterFetcher';
import { makeUserGroupSuggestions } from './user/permissionUtils';

const UserIn: IAntlersTag = {
	tagName: 'user:in',
	hideFromCompletions: false,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	requiresClose: true,
	injectParentScope: false,
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
			return exclusiveResult(makeUserGroupSuggestions(getParameterArrayValue(params.activeParameter), params.project));
		}

		return null;
	}
};

export default UserIn;
