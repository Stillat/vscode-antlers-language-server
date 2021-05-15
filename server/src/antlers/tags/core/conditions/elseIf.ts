import { IAntlersTag } from '../../../tagManager';
import { returnDynamicParameter } from '../../dynamicParameterResolver';

const ElseIf: IAntlersTag = {
	tagName: 'elseif',
	hideFromCompletions: true,
	allowsArbitraryParameters: true,
	allowsContentClose: false,
	requiresClose: true,
	injectParentScope: true,
	parameters: [],
	resolveDynamicParameter: returnDynamicParameter
};

export default ElseIf;
