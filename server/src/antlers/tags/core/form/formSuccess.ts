import { makeTagDoc } from '../../../../documentation/utils';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { exclusiveResultList, IAntlersParameter, IAntlersTag } from '../../../tagManager';
import FormHandleParam from './formHandleParam';
import { HandleParams } from './parameterCompletions';
import { resolveFormSetReference } from './resolveFormSetReference';

const FormSuccess: IAntlersTag = {
    tagName: 'form:success',
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    hideFromCompletions: false,
    injectParentScope: false,
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
