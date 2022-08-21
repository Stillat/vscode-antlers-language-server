import { makeTagDoc } from '../../../documentation/utils';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { Scope } from '../../scope/scope';
import { IAntlersTag } from '../../tagManager';
import { makeUserPermissionsVariables } from '../../variables/userPermissionsVariables';

const UserGroups: IAntlersTag = {
    tagName: 'user_groups',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: true,
    injectParentScope: false,
    introducedIn: '3.3.31',
    requiresClose: false,
    parameters: [
        {
            name: 'handle',
            description: 'A list of group handles to include',
            aliases: [],
            allowsVariableReference: true,
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false,
            acceptsVariableInterpolation: true
        }
    ],
    augmentScope: (node: AntlersNode, scope: Scope) => {
        if (node.isClosingTag) {
            return scope;
        }

        scope.addVariables(makeUserPermissionsVariables(node));

        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'user_groups Tag',
            'The `user_groups` tag can be used to return information about a site\'s user groups.',
            null
        );
    }
}

export default UserGroups;
