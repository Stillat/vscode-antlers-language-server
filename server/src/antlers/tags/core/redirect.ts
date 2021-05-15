import { RedirectStatusCodes } from '../../../suggestions/defaults/httpStatusCodes';
import { EmptyCompletionResult, exclusiveResult, IAntlersParameter, IAntlersTag } from '../../tagManager';

const Redirect: IAntlersTag = {
	tagName: 'redirect',
	hideFromCompletions: false,
	injectParentScope: false,
	requiresClose: false,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	parameters: [{
		name: 'to',
		description: 'The destination URL',
		aliases: ['url'],
		allowsVariableReference: false,
		acceptsVariableInterpolation: false,
		expectsTypes: ['string'],
		isDynamic: false,
		isRequired: true
	}, {
		name: 'response',
		description: 'The HTTP response code to use',
		acceptsVariableInterpolation: false,
		aliases: [],
		allowsVariableReference: false,
		expectsTypes: ['number'],
		isDynamic: false,
		isRequired: false
	}],
	resovleParameterCompletionItems: (parameter: IAntlersParameter) => {
		if (parameter.name == 'response') {
			return exclusiveResult(RedirectStatusCodes);
		}

		return EmptyCompletionResult;
	}
};

export default Redirect;
