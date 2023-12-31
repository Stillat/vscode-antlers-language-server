import { makeTagDoc } from '../../../documentation/utils.js';
import { IProjectDetailsProvider } from '../../../projects/projectDetailsProvider.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../tagManager.js';
import { returnDynamicParameter } from '../dynamicParameterResolver.js';
import { SessionVariableContext } from './contexts/sessionContext.js';

const SessionSet: IAntlersTag = {
    tagName: 'session:set',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: true,
    allowsContentClose: true,
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
    resolveDocumentation: (params: ISuggestionRequest) => {
        return makeTagDoc(
            'session:set Tag',
            'The `session:set` tag is used to add new data to the user\'s session.',
            'https://statamic.dev/tags/session-set'
        );
    }
};

export default SessionSet;
