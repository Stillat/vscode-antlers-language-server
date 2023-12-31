import { makeTagDoc } from '../../../../documentation/utils.js';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { Scope } from '../../../scope/scope.js';
import { exclusiveResultList, IAntlersParameter, IAntlersTag, } from "../../../tagManager.js";
import FormHandleParam from "./formHandleParam.js";
import { HandleParams } from "./parameterCompletions.js";
import { resolveFormSetReference } from "./resolveFormSetReference.js";
import { getFormHandle } from "./utils.js";

const FormSubmissions: IAntlersTag = {
    tagName: "form:submissions",
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: true,
    introducedIn: null,
    parameters: [FormHandleParam],
    resolveSpecialType: resolveFormSetReference,
    resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
        if (HandleParams.includes(parameter.name)) {
            return exclusiveResultList(params.project.getUniqueFormNames());
        }

        return null;
    },
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        if (symbol.isClosingTag) {
            return scope;
        }

        const formHandle = getFormHandle(symbol);

        if (formHandle.length > 0) {
            const formFields =
                scope.statamicProject.getFormBlueprintFields(formHandle);

            scope.addBlueprintFields(symbol, formFields);
        }

        scope.addVariable({
            name: "date",
            dataType: "date",
            sourceField: null,
            sourceName: "*internal.forms.submissions",
            introducedBy: symbol,
        });
        scope.addVariable({
            name: "no_results",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.forms.submissions",
            introducedBy: symbol,
        });
        scope.addVariable({
            name: "total_results",
            dataType: "number",
            sourceField: null,
            sourceName: "*internal.forms.submissions",
            introducedBy: symbol,
        });

        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'form:submissions Tag',
            'The `form:submissions` tag can be used to fetch previously saved submissions for a form.',
            'https://statamic.dev/tags/form-submissions'
        );
    }
};

export default FormSubmissions;
