import { makeTagDoc } from '../../../documentation/utils.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { Scope } from '../../scope/scope.js';
import { IAntlersTag } from '../../tagManager.js';
import { makeUserPermissionsVariables } from '../../variables/userPermissionsVariables.js';

const UserRoles: IAntlersTag = {
    tagName: 'user_roles',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: true,
    injectParentScope: false,
    introducedIn: '3.3.31',
    requiresClose: false,
    parameters: [
        {
            name: 'handle',
            description: 'A list of role handles to include',
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
            'user_roles Tag',
            'The `user_roles` tag can be used to return information about a site\'s user roles.',
            null
        );
    }
}

export default UserRoles;
