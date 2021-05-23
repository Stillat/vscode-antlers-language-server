import { formatSuggestionList } from '../../../suggestions/fieldFormatter';
import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { Scope } from '../../scope/engine';
import { EmptyCompletionResult, exclusiveResult, IAntlersParameter, IAntlersTag } from '../../tagManager';
import { ISymbol } from '../../types';
import { UserProfileParameters } from './user';

const UserProfile: IAntlersTag = {
	tagName: 'user:profile',
	hideFromCompletions: false,
	requiresClose: true,
	injectParentScope: false,
	allowsContentClose: false,
	allowsArbitraryParameters: false,
	parameters: UserProfileParameters,
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
