import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { EmptyCompletionResult, exclusiveResult, IAntlersParameter, IAntlersTag, ICompletionResult } from '../../tagManager';
import { getParameterArrayValue } from './../parameterFetcher';
import { getAllRolesSuggestions, makeUserRolesSuggestions } from './user/permissionUtils';

const Is: IAntlersTag = {
	tagName: 'is',
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
	},
	resolveCompletionItems: (params: ISuggestionRequest): ICompletionResult => {
		if ((params.leftWord == 'is' || params.leftWord == '/is') && params.leftChar == ':') {
			return exclusiveResult(getAllRolesSuggestions(params.project));
		}

		return EmptyCompletionResult;
	}
};

export default Is;
