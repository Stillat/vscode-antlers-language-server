import { BooleanCompletionItems } from '../../../../suggestions/defaults/booleanItems.js';
import FormHttpVerbCompletions from '../../../../suggestions/defaults/httpVerbItems.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { exclusiveResult, exclusiveResultList, IAntlersParameter, ICompletionResult } from '../../../tagManager.js';

const HandleParams: string[] = [
    'in', 'handle', 'is', 'form', 'formset'
];

export { HandleParams };

export function resolveFormParameterCompletions(parameter: IAntlersParameter, params: ISuggestionRequest): ICompletionResult | null {
    if (HandleParams.includes(parameter.name)) {
        return exclusiveResultList(params.project.getUniqueFormNames());
    }

    if (parameter.name == 'method') {
        return exclusiveResult(FormHttpVerbCompletions);
    }

    if (parameter.name == 'files') { return exclusiveResult(BooleanCompletionItems); }

    return null;
}
