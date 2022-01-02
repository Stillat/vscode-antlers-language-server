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
    }
};

export default FormSuccess;
