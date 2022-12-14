import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { Scope } from '../../scope/scope';
import { IScopeVariable } from '../../scope/types';
import { IAntlersTag } from '../../tagManager';
import { makeFieldsVariables } from '../../variables/forms/fieldsVariables';
import { makeStandardFormVariables } from '../../variables/forms/standardFormVariables';

function makePasswordFormVariables(symbol: AntlersNode): IScopeVariable[] {
    return [
        { name: 'current_password', dataType: 'string', sourceName: '*internal.user_password_form', sourceField: null, introducedBy: symbol },
        { name: 'password', dataType: 'string', sourceName: '*internal.user_password_form', sourceField: null, introducedBy: symbol },
        { name: 'password_confirmation', dataType: 'string', sourceName: '*internal.user_password_form', sourceField: null, introducedBy: symbol },
    ];
}

const UserPasswordForm: IAntlersTag = {
    tagName: 'user:password_form',
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsContentClose: true,
    parameters: [
        {
            name: 'redirect',
            description: 'The location to redirect users after a successful form submission',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false
        },
        {
            name: 'error_redirect',
            description: 'The location to redirect users to after a failed form submission',
            allowsVariableReference: false,
            acceptsVariableInterpolation: false,
            aliases: [],
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false
        },
        {
            name: 'allow_request_redirect',
            description: 'Indicates if query parameters can override redirect or error_redirect',
            aliases: [],
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            expectsTypes: ['boolean'],
            isDynamic: false,
            isRequired: false
        }
    ],
    introducedIn: '3.3.61',
    allowsArbitraryParameters: true,
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        scope.addVariables(makeStandardFormVariables(symbol));
        scope.addVariable({ dataType: 'array', name: 'errors', sourceField: null, sourceName: '*internal.forms', introducedBy: symbol });
        scope.addVariableArray('fields', makeFieldsVariables(symbol));

        const scopeVariables = makePasswordFormVariables(symbol);

        scope.addVariableArray('old', scopeVariables);
        scope.addVariableArray('error', scopeVariables);

        return scope;
    }
};

export default UserPasswordForm;
