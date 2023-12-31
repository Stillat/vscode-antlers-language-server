import { makeTagDoc } from '../../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { exclusiveResultList, IAntlersParameter, IAntlersTag } from '../../../tagManager.js';
import FormHandleParam from './formHandleParam.js';
import { HandleParams } from './parameterCompletions.js';
import { resolveFormSetReference } from './resolveFormSetReference.js';

const FormSuccess: IAntlersTag = {
    tagName: 'form:success',
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    hideFromCompletions: false,
    injectParentScope: false,
    introducedIn: null,
    parameters: [
        FormHandleParam
    ],
    resolveSpecialType: resolveFormSetReference,
    resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
        if (HandleParams.includes(parameter.name)) {
            return exclusiveResultList(params.project.getUniqueFormNames());
        }

        return null;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'form:success Tag',
            'The `form:success` tag can be used to check if a form submission was successful or not.',
            'https://statamic.dev/tags/form-success'
        );
    }
};

export default FormSuccess;
