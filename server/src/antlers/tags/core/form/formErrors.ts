import { makeTagDoc } from '../../../../documentation/utils';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { exclusiveResultList, IAntlersParameter, IAntlersTag } from '../../../tagManager';
import FormHandleParam from './formHandleParam';
import { HandleParams } from './parameterCompletions';
import { resolveFormSetReference } from './resolveFormSetReference';

const FormErrors: IAntlersTag = {
    tagName: 'form:errors',
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
            'form:errors Tag',
            'The `form:errors` tag can be used to retrieve validation errors after a user has submitted a form.',
            'https://statamic.dev/tags/form-errors'
        );
    }
};

export default FormErrors;
