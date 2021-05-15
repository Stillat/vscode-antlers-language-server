import { IAntlersTag } from '../../tagManager';

const Increment: IAntlersTag = {
	tagName: 'increment',
	hideFromCompletions: false,
	requiresClose: false,
	injectParentScope: false,
	allowsContentClose: false,
	allowsArbitraryParameters: false,
	parameters: [
		{
			isRequired: false,
			name: 'from',
			aliases: [],
			description: 'The number to start incrementing by',
			acceptsVariableInterpolation: false,
			allowsVariableReference: false,
			expectsTypes: ['number'],
			isDynamic: false
		},
		{
			isRequired: false,
			name: 'by',
			aliases: [],
			description: 'The number to increment by',
			acceptsVariableInterpolation: false,
			allowsVariableReference: false,
			expectsTypes: ['number'],
			isDynamic: false
		}
	]
};

export default Increment;
