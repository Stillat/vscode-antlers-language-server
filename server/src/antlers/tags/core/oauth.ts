import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { exclusiveResultList, IAntlersParameter, IAntlersTag } from '../../tagManager';

const OAuth: IAntlersTag = {
	tagName: 'oauth',
	hideFromCompletions: false,
	injectParentScope: false,
	requiresClose: false,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	parameters: [{
		name: 'provider',
		description: 'The OAuth provider to be used',
		aliases: [],
		isRequired: true,
		acceptsVariableInterpolation: true,
		allowsVariableReference: false,
		isDynamic: false,
		expectsTypes: ['string']
	}, {
		name: 'redirect',
		description: 'The URL to be taken to after authenticating',
		aliases: [],
		isRequired: true,
		acceptsVariableInterpolation: true,
		allowsVariableReference: false,
		isDynamic: false,
		expectsTypes: ['string']
	}],
	resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
		if (parameter.name == 'provider') {
			return exclusiveResultList(params.project.getOAuthProviders());
		}

		return null;
	}
};

export default OAuth;
