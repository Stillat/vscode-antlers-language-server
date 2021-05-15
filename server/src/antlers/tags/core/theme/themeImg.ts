import { IAntlersTag } from '../../../tagManager';
import { ThemePathParameters } from './theme';

const ThemeImg: IAntlersTag = {
	tagName: 'theme:img',
	hideFromCompletions: false,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	requiresClose: false,
	injectParentScope: false,
	parameters: [
		...ThemePathParameters,
		{
			isRequired: false,
			isDynamic: false,
			aliases: [],
			acceptsVariableInterpolation: false,
			allowsVariableReference: true,
			name: 'tag',
			description: 'Whether to generate an HTML tag',
			expectsTypes: ['boolean']
		},
		{
			isRequired: false,
			isDynamic: false,
			aliases: [],
			acceptsVariableInterpolation: false,
			allowsVariableReference: true,
			name: 'alt',
			description: 'The alt text to use when generating the HTML tag',
			expectsTypes: ['string']
		}
	]
};

export default ThemeImg;
