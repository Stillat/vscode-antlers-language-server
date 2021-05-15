import { StatamicProject } from '../../../projects/statamicProject';
import { IAntlersTag } from '../../tagManager';
import { ISymbol } from '../../types';
import { returnDynamicParameter } from '../dynamicParameterResolver';
import { SessionVariableContext } from './session';

const SessionFlash: IAntlersTag = {
	tagName: 'session:flash',
	hideFromCompletions: false,
	injectParentScope: false,
	requiresClose: false,
	allowsArbitraryParameters: true,
	allowsContentClose: false,
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

export default SessionFlash;
