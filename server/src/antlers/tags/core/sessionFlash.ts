import { makeTagDoc } from '../../../documentation/utils';
import { IProjectDetailsProvider } from '../../../projects/projectDetailsProvider';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';
import { returnDynamicParameter } from '../dynamicParameterResolver';
import { SessionVariableContext } from './contexts/sessionContext';

const SessionFlash: IAntlersTag = {
    tagName: 'session:flash',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: true,
    allowsContentClose: false,
    parameters: [],
	introducedIn: null,
    resolveDynamicParameter: returnDynamicParameter,
    resolveSpecialType: (node: AntlersNode, project: IProjectDetailsProvider) => {
        const context = new SessionVariableContext(node);

        return {
            context: context,
            issues: []
        };
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'session:flash Tag',
            'The `session:flash` tag can be used to add a value to the user\'s session. Flashed values only persist for a single request, and are then removed.',
            'https://statamic.dev/tags/session-flash'
        );
    }
};

export default SessionFlash;
