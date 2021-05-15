import { formatSuggestionList } from '../../../suggestions/fieldFormatter';
import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { Scope } from '../../scope/engine';
import { EmptyCompletionResult, exclusiveResult, IAntlersParameter, IAntlersTag } from '../../tagManager';
import { ISymbol } from '../../types';

const UserProfile: IAntlersTag = {
	tagName: 'user:profile',
	hideFromCompletions: false,
	requiresClose: true,
	injectParentScope: false,
	allowsContentClose: false,
	allowsArbitraryParameters: false,
	parameters: [
		{
			isRequired: false,
			acceptsVariableInterpolation: false,
			allowsVariableReference: true,
			aliases: [],
			name: 'id',
			description: 'The user ID to fetch',
			expectsTypes: ['string'],
			isDynamic: false
		},
		{
			isRequired: false,
			acceptsVariableInterpolation: false,
			allowsVariableReference: true,
			aliases: [],
			name: 'email',
			description: 'The email address to find the user by',
			expectsTypes: ['string'],
			isDynamic: false
		},
		{
			isRequired: false,
			acceptsVariableInterpolation: false,
			allowsVariableReference: true,
			aliases: [],
			name: 'field',
			description: 'The field to fetch the user by',
			expectsTypes: ['string'],
			isDynamic: false
		},
		{
			isRequired: false,
			acceptsVariableInterpolation: false,
			allowsVariableReference: true,
			aliases: [],
			name: 'value',
			description: 'The value to search for',
			expectsTypes: ['string'],
			isDynamic: false
		}
	],
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		scope.injectBlueprint(symbol, 'user');

		return scope;
	},
	resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
		if (parameter.name == 'field') {
			return exclusiveResult(formatSuggestionList(params.project.getUserFields()));
		}

		return EmptyCompletionResult;
	}
};

export default UserProfile;
