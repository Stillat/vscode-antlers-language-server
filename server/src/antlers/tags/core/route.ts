import { getRouteCompletions } from '../../../suggestions/project/routeCompletions';
import { getCurrentSymbolMethodNameValue, ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag, ICompletionResult } from '../../tagManager';
import { returnDynamicParameter } from '../dynamicParameterResolver';

const Route: IAntlersTag = {
	tagName: 'route',
	hideFromCompletions: false,
	injectParentScope: false,
	requiresClose: false,
	allowsArbitraryParameters: true,
	allowsContentClose: false,
	parameters: [],
	resolveDynamicParameter: returnDynamicParameter,
	resolveCompletionItems: (params: ISuggestionRequest): ICompletionResult => {
		if (params.leftMeaningfulWord == 'route') {
			const existingRouteValue = getCurrentSymbolMethodNameValue(params);

			return exclusiveResult(getRouteCompletions(existingRouteValue, params.project));
		}

		return EmptyCompletionResult;
	}
};

export default Route;
