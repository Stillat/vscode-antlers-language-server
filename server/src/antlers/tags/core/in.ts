import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { EmptyCompletionResult, exclusiveResult, IAntlersParameter, IAntlersTag, ICompletionResult } from '../../tagManager';
import { getParameterArrayValue } from './../parameterFetcher';
import { getAllGroupSuggestionsn, makeUserGroupSuggestions } from './user/permissionUtils';

const In: IAntlersTag = {
	tagName: 'in',
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
	},
	resolveCompletionItems: (params: ISuggestionRequest): ICompletionResult => {
		if ((params.leftWord == 'in' || params.leftWord == '/in') && params.leftChar == ':') {
			return exclusiveResult(getAllGroupSuggestionsn(params.project));
		}

		return EmptyCompletionResult;
	}
};

export default In;
