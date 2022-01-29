import { makeTagDoc } from '../../../../documentation/utils';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { Scope } from '../../../scope/scope';
import { exclusiveResultList, IAntlersParameter, IAntlersTag, } from "../../../tagManager";
import FormHandleParam from "./formHandleParam";
import { HandleParams } from "./parameterCompletions";
import { resolveFormSetReference } from "./resolveFormSetReference";
import { getFormHandle } from "./utils";

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
