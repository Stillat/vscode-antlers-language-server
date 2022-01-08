import { makeTagDoc } from '../../../../documentation/utils';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { Scope } from '../../../scope/scope';
import { exclusiveResultList, IAntlersParameter, IAntlersTag, } from "../../../tagManager";
import FormHandleParam from "./formHandleParam";
import { HandleParams } from "./parameterCompletions";
import { resolveFormSetReference } from "./resolveFormSetReference";
import { getFormHandle } from "./utils";

const FormSubmission: IAntlersTag = {
    tagName: "form:submission",
    requiresClose: true,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    hideFromCompletions: false,
    injectParentScope: false,
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
