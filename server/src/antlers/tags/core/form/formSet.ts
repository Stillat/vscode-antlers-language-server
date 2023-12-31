import { makeTagDoc } from '../../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../../tagManager.js';
import { resolveFormParameterCompletions } from './parameterCompletions.js';

const FormSetTag: IAntlersTag = {
    tagName: 'form:set',
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    hideFromCompletions: false,
    injectParentScope: false,
    introducedIn: null,
    parameters: [
        {
            name: 'in',
            description: 'The form to use',
            acceptsVariableInterpolation: true,
            aliases: ['handle', 'is', 'form', 'formset'],
            allowsVariableReference: true,
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: true
        }
    ],
    resovleParameterCompletionItems: resolveFormParameterCompletions,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'form:set Tag',
            'The `form:set` tag can be used to set the form handle on all nested form tags.',
            'https://statamic.dev/tags/form-set'
        );
    }
};

export default FormSetTag;
