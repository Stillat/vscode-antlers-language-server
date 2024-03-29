import { makeTagDoc } from '../../../documentation/utils.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { Scope } from '../../scope/scope.js';
import { IScopeVariable } from '../../scope/types.js';
import { IAntlersTag } from '../../tagManager.js';
import { createDefinitionAlias } from '../alias.js';
import { returnDynamicParameter } from '../dynamicParameterResolver.js';

function makeUserLoginFields(node: AntlersNode): IScopeVariable[] {
    return [
        { name: 'email', dataType: 'string', sourceName: '*internal.user.login', sourceField: null, introducedBy: node },
        { name: 'password', dataType: 'string', sourceName: '*internal.user.login', sourceField: null, introducedBy: node },
    ];
}

const UserLoginForm: IAntlersTag = {
    tagName: 'user:login_form',
    allowsArbitraryParameters: true,
    allowsContentClose: false,
    requiresClose: true,
    hideFromCompletions: false,
    injectParentScope: false,
    introducedIn: null,
    parameters: [
        {
            name: 'redirect',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: true,
            description: 'Where the user should be redirected after logging in',
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false
        },
        {
            name: 'error_redirect',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: true,
            description: 'Where the user should be redirected after failed login attempts',
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false
        },
        {
            name: 'allow_request_redirect',
            description: 'Indicates if query parameters can override the redirect and error_redirect parameters',
            acceptsVariableInterpolation: false,
            allowsVariableReference: true,
            aliases: [],
            expectsTypes: ['boolean'],
            isDynamic: false,
            isRequired: false
        }
    ],
    resolveDynamicParameter: returnDynamicParameter,
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariables([
            { name: 'errors', dataType: 'array', sourceName: '*internal.user.login', sourceField: null, introducedBy: node },
            { name: 'success', dataType: 'string', sourceName: '*internal.user.login', sourceField: null, introducedBy: node },
        ]);

        scope.addVariables(makeUserLoginFields(node));

        scope.addVariableArray('old', makeUserLoginFields(node));
        scope.addVariableArray('error', makeUserLoginFields(node));

        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'user:login_form Tag',
            'The `user:login_form` tag can be used to quickly create a form that users can use to authenticate with the site.',
            'https://statamic.dev/tags/user-login_form'
        );
    }
};

const MemberLoginForm = createDefinitionAlias(UserLoginForm, 'member:login_form');

export { UserLoginForm, MemberLoginForm };
