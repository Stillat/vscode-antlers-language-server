import { IProjectDetailsProvider } from '../../../projects/projectDetailsProvider';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { IAntlersTag } from '../../tagManager';
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
    resolveSpecialType: (node: AntlersNode, project: IProjectDetailsProvider) => {
        const context = new SessionVariableContext(node);

        return {
            context: context,
            issues: []
        };
    }
};

export default SessionSet;
