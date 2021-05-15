import { IAntlersTag } from '../../tagManager';

const IterateTag: IAntlersTag = {
	tagName: 'iterate',
	hideFromCompletions: false,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	requiresClose: true,
	injectParentScope: false,
	parameters: [
		{
			name: 'as',
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: false,
			description: 'Optionally rename the key/value variables',
			expectsTypes: ['string'],
			isDynamic: false,
			isRequired: false
		}
	]
};

const ForeachTag: IAntlersTag = {
	tagName: 'foreach',
	hideFromCompletions: false,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	requiresClose: true,
	injectParentScope: false,
	parameters: [
		{
			name: 'as',
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: false,
			description: 'Optionally rename the key/value variables',
			expectsTypes: ['string'],
			isDynamic: false,
			isRequired: false
		}
	]
};

export {
	IterateTag, ForeachTag
};
