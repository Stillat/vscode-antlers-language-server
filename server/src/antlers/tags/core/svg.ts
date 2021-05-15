import { IAntlersTag } from '../../tagManager';
import { returnDynamicParameter } from '../dynamicParameterResolver';

const SVGTag: IAntlersTag = {
	tagName: 'svg',
	hideFromCompletions: false,
	requiresClose: false,
	injectParentScope: false,
	allowsArbitraryParameters: true,
	allowsContentClose: false,
	parameters: [
		{
			isRequired: false,
			name: 'src',
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: false,
			description: 'The SVG filename relative to the project root',
			expectsTypes: ['string'],
			isDynamic: false
		}
	],
	resolveDynamicParameter: returnDynamicParameter
};

export default SVGTag;
