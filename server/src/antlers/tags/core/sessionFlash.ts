import { makeTagDoc } from '../../../documentation/utils.js';
import { IProjectDetailsProvider } from '../../../projects/projectDetailsProvider.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../tagManager.js';
import { returnDynamicParameter } from '../dynamicParameterResolver.js';
import { SessionVariableContext } from './contexts/sessionContext.js';

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
