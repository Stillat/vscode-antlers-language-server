import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { exclusiveResultList, IAntlersParameter, IAntlersTag } from '../../tagManager';

const GetContent: IAntlersTag = {
	tagName: 'get_content',
	hideFromCompletions: false,
	requiresClose: true,
	injectParentScope: false,
	allowsContentClose: false,
	allowsArbitraryParameters: false,
	parameters: [
		{
			isRequired: false,
			name: 'from',
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: true,
			description: 'The URI or URIs to retrieve data for',
			expectsTypes: ['string', 'array'],
			isDynamic: false,
		},
		{
			isRequired: false,
			name: 'locale',
			aliases: ['site'],
			acceptsVariableInterpolation: false,
			allowsVariableReference: false,
			description: 'The locale to show the content in',
			expectsTypes: ['string'],
			isDynamic: false
		}
	],
	resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
		if (parameter.name == 'locale' || parameter.name == 'site') {
			return exclusiveResultList(params.project.getSiteNames());
		}

		return null;
	}
};

export default GetContent;
