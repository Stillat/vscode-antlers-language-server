import { makeTagDoc } from '../../../documentation/utils';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { Scope } from '../../scope/scope';
import { blueprintFieldsToScopeVariables } from '../../scope/scopeUtilities';
import { IAntlersTag } from '../../tagManager';
import { makeFieldsVariables } from '../../variables/forms/fieldsVariables';
import { createDefinitionAlias } from '../alias';
import { returnDynamicParameter } from '../dynamicParameterResolver';

const UserRegister: IAntlersTag = {
    tagName: 'user:register_form',
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
            description: 'Where the user should be redirected after registering',
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false
        },
        {
            name: 'error_redirect',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: true,
            description: 'Where the user should be redirected after failed registration attempts',
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
        scope.addVariableArray('fields', makeFieldsVariables(node));
        scope.addVariable({ name: 'errors', dataType: 'array', sourceName: '*internal.user.register_form', sourceField: null, introducedBy: node });
        scope.addVariable({ name: 'old', dataType: 'array', sourceName: '*internal.user.register_form', sourceField: null, introducedBy: node });
        scope.addVariable({ name: 'error', dataType: 'array', sourceName: '*internal.user.register_form', sourceField: null, introducedBy: node });
        scope.addVariable({ name: 'success', dataType: 'string', sourceName: '*internal.user.register_form', sourceField: null, introducedBy: node });

        const userFields = scope.statamicProject.getUserFields();

        if (userFields.length > 0) {
            const userFormFields = blueprintFieldsToScopeVariables(node, userFields);

            scope.addVariableArray('old', userFormFields);
            scope.addVariableArray('error', userFormFields);
        }

        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'user:register_form  Form Tag',
            'The `user:register_form` tag can be used to build out public registration forms for new users.',
            'https://statamic.dev/tags/user-register_form'
        );
    }
};

const MemberRegister = createDefinitionAlias(UserRegister, 'member:register_form');

MemberRegister.resolveDocumentation = (params?: ISuggestionRequest) => {
    return makeTagDoc(
        'member:register_form Tag',
        'The `member:register_form` tag can be used to build out public registration forms for new users.',
        'https://statamic.dev/tags/user-register_form'
    );
};

export { UserRegister, MemberRegister };
