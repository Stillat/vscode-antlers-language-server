import { CompletionItem, CompletionItemKind, } from "vscode-languageserver-types";
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { tagToCompletionItem } from '../../../documentedLabel';
import { EmptyCompletionResult, IAntlersTag, nonExclusiveResult, } from "../../../tagManager";
import FormCreate from './formCreate';
import FormErrors from './formErrors';
import FormSetTag from './formSet';
import FormSubmission from './formSubmission';
import FormSubmissions from './formSubmissions';
import FormSuccess from './formSuccess';
import { resolveFormParameterCompletions } from "./parameterCompletions";

const FormCompletions: CompletionItem[] = [
    tagToCompletionItem(FormSetTag),
    tagToCompletionItem(FormCreate),
    tagToCompletionItem(FormErrors),
    tagToCompletionItem(FormSuccess),
    tagToCompletionItem(FormSubmissions),
    tagToCompletionItem(FormSubmission)
];

const FormTag: IAntlersTag = {
    tagName: "form",
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    hideFromCompletions: false,
    injectParentScope: false,
	introducedIn: null,
    parameters: [],
    resovleParameterCompletionItems: resolveFormParameterCompletions,
    resolveCompletionItems: (params: ISuggestionRequest) => {
        let items: CompletionItem[] = [];

        if (params.isPastTagPart == false &&
            (params.leftWord == "form" || params.leftWord == "/form") &&
            params.leftChar == ":") {
            const formNames = params.project.getUniqueFormNames();

            items = items.concat(FormCompletions);

            for (let i = 0; i < formNames.length; i++) {
                items.push({
                    label: formNames[i],
                    kind: CompletionItemKind.Field,
                });
            }

            return nonExclusiveResult(items);
        }

        return EmptyCompletionResult;
    },
};

export default FormTag;
