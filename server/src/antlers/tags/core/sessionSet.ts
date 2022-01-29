import { makeTagDoc } from '../../../documentation/utils';
import { IProjectDetailsProvider } from '../../../projects/projectDetailsProvider';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';
import { returnDynamicParameter } from '../dynamicParameterResolver';
import { SessionVariableContext } from './contexts/sessionContext';

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
