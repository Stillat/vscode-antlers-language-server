import { getAllAssetCompletions } from '../../../suggestions/project/assetCompletions';
import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { Scope } from '../../scope/engine';
import { EmptyCompletionResult, exclusiveResult, IAntlersParameter, IAntlersTag } from '../../tagManager';
import { getParameterFromLists, ISymbol } from '../../types';
import { makeAssetVariables } from '../../variables/assetVariables';

const AssetContainerParameters: string[] = [
	'container', 'id', 'handle'
];

const Assets: IAntlersTag = {
	tagName: 'assets',
	hideFromCompletions: false,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	requiresClose: true,
	injectParentScope: false,
	parameters: [
		{
			isRequired: false,
			name: 'container',
			aliases: ['id', 'handle'],
			acceptsVariableInterpolation: false,
			allowsVariableReference: false,
			description: 'The handle of the asset container',
			expectsTypes: ['string'],
			isDynamic: false
		},
		{
			isRequired: false,
			name: 'folder',
			aliases: [],
			acceptsVariableInterpolation: false,
			allowsVariableReference: false,
			description: 'Filters the resulting assets by specific folder',
			expectsTypes: ['string'],
			isDynamic: false
		},
		{
			isRequired: false,
			name: 'recursive',
			aliases: [],
			acceptsVariableInterpolation: false,
			allowsVariableReference: false,
			description: 'Returns all assets in all subdirectories',
			expectsTypes: ['boolean'],
			isDynamic: false
		},
		{
			isRequired: false,
			name: 'limit',
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: false,
			description: 'Limits the total results',
			expectsTypes: ['number'],
			isDynamic: false
		},
		{
			isRequired: false,
			name: 'sort',
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: false,
			description: 'Sort entries by any asset variable',
			expectsTypes: ['string', 'array'],
			isDynamic: false
		}
	],
	resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
		if (AssetContainerParameters.includes(parameter.name)) {
			return exclusiveResult(getAllAssetCompletions(params.project));
		}

		return EmptyCompletionResult;
	},
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		scope.addVariables(makeAssetVariables(symbol));

		let containerName = '';

		if (symbol.methodName != null && symbol.methodName.length > 0) {
			containerName = symbol.methodName;
		} else {
			const containerParam = getParameterFromLists(AssetContainerParameters, symbol);

			if (containerParam != null && containerParam.isDynamicBinding == false && containerParam.containsInterpolation == false) {
				containerName = containerParam.value;
			}
		}

		if (containerName.length > 0) {
			scope.injectAssetContainer(symbol, containerName);
		}

		return scope;
	},
	resolveCompletionItems: (params: ISuggestionRequest) => {
		if ((params.leftWord == 'assets' || params.leftWord == '/assets') && params.leftChar == ':') {
			return exclusiveResult(getAllAssetCompletions(params.project));
		}
		return EmptyCompletionResult;
	}
};

export default Assets;
