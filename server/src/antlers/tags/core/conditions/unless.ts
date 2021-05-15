import { returnDynamicParameter } from '../../dynamicParameterResolver';

const Unless = {
	tagName: 'unless',
	hideFromCompletions: true,
	allowsArbitraryParameters: true,
	allowsContentClose: false,
	requiresClose: true,
	injectParentScope: true,
	parameters: [],
	resolveDynamicParameter: returnDynamicParameter
};

export default Unless;
