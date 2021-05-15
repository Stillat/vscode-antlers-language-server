import { convertImmediateScopeToCompletionList, ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag, ICompletionResult } from '../../tagManager';

const Dump: IAntlersTag = {
	tagName: 'dump',
	hideFromCompletions: false,
	requiresClose: false,
	injectParentScope: false,
	allowsContentClose: false,
	allowsArbitraryParameters: false,
	parameters: [],
	resolveCompletionItems: (params: ISuggestionRequest): ICompletionResult => {
		if (params.leftWord == 'dump' && params.leftChar == ':') {
			return exclusiveResult(convertImmediateScopeToCompletionList(params));
		}

		return EmptyCompletionResult;
	}
};

export default Dump;
