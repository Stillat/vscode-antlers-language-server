import { makeTagDoc } from '../../../documentation/utils';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { Scope } from '../../scope/scope';
import { IAntlersTag } from '../../tagManager';
import { makeUserPermissionsVariables } from '../../variables/userPermissionsVariables';

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
