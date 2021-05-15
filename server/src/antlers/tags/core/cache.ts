import { StatamicProject } from '../../../projects/statamicProject';
import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { exclusiveResultList, IAntlersParameter, IAntlersTag, ICompletionResult } from '../../tagManager';
import { getParameter, ISymbol } from '../../types';
import { getParameterValue } from './../parameterFetcher';
import { ICacheContext } from './contexts/cacheContext';

const Cache: IAntlersTag = {
	tagName: 'cache',
	hideFromCompletions: false,
	requiresClose: true,
	injectParentScope: false,
	allowsContentClose: false,
	allowsArbitraryParameters: false,
	resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
		if (parameter.name == 'scope') {
			return exclusiveResultList(['page', 'site']);
		}

		return null;
	},
	parameters: [
		{
			isRequired: false,
			name: "for",
			description: "The duration the cache is valid for",
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: false,
			expectsTypes: ['string'],
			isDynamic: false
		},
		{
			isRequired: false,
			name: "key",
			description: "An arbitrary name the cache entry may be referenced by",
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: false,
			expectsTypes: ['string'],
			isDynamic: false

		},
		{
			isRequired: false,
			name: "scope",
			description: " The scope of the cached value. Either site or page.",
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: false,
			expectsTypes: ['string'],
			isDynamic: false
		}
	],
	resolveSpecialType: (context: ISymbol, project: StatamicProject) => {
		const keyParameter = getParameter('key', context);
		let cacheContext: ICacheContext | null = null;

		if (keyParameter != null) {
			const cacheKeyValue = getParameterValue(keyParameter, '');

			if (cacheKeyValue.trim().length > 0) {
				cacheContext = {
					key: cacheKeyValue,
					reference: context
				};
			}
		}

		return {
			context: cacheContext,
			issues: []
		};
	}
};

export default Cache;
