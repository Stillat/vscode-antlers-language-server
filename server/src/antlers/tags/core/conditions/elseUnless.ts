import { returnDynamicParameter } from '../../dynamicParameterResolver';

const ElseUnless = {
	tagName: 'elseunless',
	hideFromCompletions: true,
	allowsArbitraryParameters: true,
	allowsContentClose: false,
	requiresClose: true,
	injectParentScope: true,
	parameters: [],
	resolveDynamicParameter: returnDynamicParameter
};

export default ElseUnless;
