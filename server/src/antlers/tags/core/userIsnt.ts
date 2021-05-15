import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { exclusiveResult, IAntlersParameter, IAntlersTag } from '../../tagManager';
import { getParameterArrayValue } from './../parameterFetcher';
import { makeUserRolesSuggestions } from './user/permissionUtils';

const UserIsnt: IAntlersTag = {
	tagName: 'user:isnt',
	hideFromCompletions: false,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	requiresClose: true,
	injectParentScope: false,
	parameters: [
		{
			isRequired: true,
			acceptsVariableInterpolation: false,
			aliases: ['roles'],
			allowsVariableReference: false,
			name: 'role',
			description: 'The roles to check against',
			expectsTypes: ['string', 'array'],
			isDynamic: false
		}
	],
	resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
		if (parameter.name == 'roles' || parameter.name == 'role') {
			return exclusiveResult(makeUserRolesSuggestions(getParameterArrayValue(params.activeParameter), params.project));
		}

		return null;
	}
};

export default UserIsnt;
