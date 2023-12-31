import { makeTagDoc } from '../../../../documentation/utils.js';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { Scope } from '../../../scope/scope.js';
import { blueprintFieldsToScopeVariables } from '../../../scope/scopeUtilities.js';
import { IAntlersTag } from '../../../tagManager.js';
import { makeFieldsVariables } from '../../../variables/forms/fieldsVariables.js';
import { makeStandardFormVariables } from '../../../variables/forms/standardFormVariables.js';
import { returnDynamicParameter } from '../../dynamicParameterResolver.js';
import FormHandleParam from './formHandleParam.js';
import { resolveFormParameterCompletions } from './parameterCompletions.js';
import { resolveFormSetReference } from './resolveFormSetReference.js';
import { getFormHandle } from './utils.js';


const FormCreate: IAntlersTag = {
    tagName: 'form:create',
    allowsArbitraryParameters: true,
    allowsContentClose: false,
    requiresClose: true,
    hideFromCompletions: false,
    injectParentScope: false,
    introducedIn: null,
    parameters: [
        FormHandleParam,
        {
            name: 'method',
            description: 'The HTTP method to use',
            allowsVariableReference: false,
            acceptsVariableInterpolation: false,
            aliases: [],
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false,
        },
        {
            name: 'files',
            description: 'Indicates if the form sends file data',
            aliases: [],
            allowsVariableReference: false,
            acceptsVariableInterpolation: false,
            expectsTypes: ['boolean'],
            isDynamic: false,
            isRequired: false
        },
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
    resolveSpecialType: resolveFormSetReference,
    resovleParameterCompletionItems: resolveFormParameterCompletions,
    resolveDynamicParameter: returnDynamicParameter,
    augmentScope: (symbol: AntlersNode, scope: Scope) => {

        scope.addVariables(makeStandardFormVariables(symbol));
        scope.addVariable({ dataType: 'array', name: 'errors', sourceField: null, sourceName: '*internal.forms', introducedBy: symbol });
        scope.addVariableArray('fields', makeFieldsVariables(symbol));

        const formHandle = getFormHandle(symbol);

        if (formHandle.length > 0) {
            const formFields = scope.statamicProject.getFormBlueprintFields(formHandle),
                scopeVariables = blueprintFieldsToScopeVariables(symbol, formFields);

            scope.addVariableArray('old', scopeVariables);
            scope.addVariableArray('error', scopeVariables);
        }

        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'form:create Tag',
            'The `form:create` tag can be used to access form data, generate field HTML markup, and handle form validation errors.',
            'https://statamic.dev/tags/form-create'
        );
    }
};

export default FormCreate;
