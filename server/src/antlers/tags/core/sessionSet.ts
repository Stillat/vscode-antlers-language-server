import { StatamicProject } from '../../../projects/statamicProject';
import { IAntlersTag } from '../../tagManager';
import { ISymbol } from '../../types';
import { returnDynamicParameter } from '../dynamicParameterResolver';
import { SessionVariableContext } from './session';

const SessionSet: IAntlersTag = {
	tagName: 'session:set',
	hideFromCompletions: false,
	injectParentScope: false,
	requiresClose: false,
	allowsArbitraryParameters: true,
	allowsContentClose: true,
	parameters: [],
	resolveDynamicParameter: returnDynamicParameter,
	resolveSpecialType: (symbol: ISymbol, project: StatamicProject) => {
		const context = new SessionVariableContext(symbol);

		return {
			context: context,
			issues: []
		};
	}
};

export default SessionSet;
