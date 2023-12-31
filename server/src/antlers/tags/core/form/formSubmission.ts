import { makeTagDoc } from '../../../../documentation/utils.js';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { Scope } from '../../../scope/scope.js';
import { exclusiveResultList, IAntlersParameter, IAntlersTag, } from "../../../tagManager.js";
import FormHandleParam from "./formHandleParam.js";
import { HandleParams } from "./parameterCompletions.js";
import { resolveFormSetReference } from "./resolveFormSetReference.js";
import { getFormHandle } from "./utils.js";

const FormSubmission: IAntlersTag = {
    tagName: "form:submission",
    requiresClose: true,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    hideFromCompletions: false,
    injectParentScope: false,
    introducedIn: null,
    parameters: [FormHandleParam],
    resolveSpecialType: resolveFormSetReference,
    resovleParameterCompletionItems: (
        parameter: IAntlersParameter,
        params: ISuggestionRequest
    ) => {
        if (HandleParams.includes(parameter.name)) {
            return exclusiveResultList(params.project.getUniqueFormNames());
        }

        return null;
    },
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        const formHandle = getFormHandle(symbol);

        if (formHandle.length > 0) {
            const formFields =
                scope.statamicProject.getFormBlueprintFields(formHandle);

            scope.addBlueprintFields(symbol, formFields);
        }

        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'form:submission Tag',
            'The `form:submission` tag can be used to access the form submission submitted by the current user.',
            'https://statamic.dev/tags/form-submission'
        );
    }
};

export default FormSubmission;
