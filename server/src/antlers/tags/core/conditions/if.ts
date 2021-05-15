import { IAntlersTag } from '../../../tagManager';
import { returnDynamicParameter } from '../../dynamicParameterResolver';

const If: IAntlersTag = {
	tagName: 'if',
	hideFromCompletions: true,
	allowsArbitraryParameters: true,
	allowsContentClose: false,
	requiresClose: true,
	injectParentScope: true,
	parameters: [],
	resolveDynamicParameter: returnDynamicParameter
};

export default If;
