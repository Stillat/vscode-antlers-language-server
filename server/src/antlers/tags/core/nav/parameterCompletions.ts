import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { exclusiveResultList, IAntlersParameter, ICompletionResult } from '../../../tagManager.js';

export function resolveNavParameterCompletions(parameter: IAntlersParameter, params: ISuggestionRequest): ICompletionResult | null {
    if (parameter.name == 'handle') {
        const collectionNames = params.project.getUniqueCollectionNames(),
            navNames = params.project.getUniqueNavigationMenuNames();
        let allSuggestions: string[] = [];

        allSuggestions = collectionNames;
        allSuggestions = allSuggestions.concat(navNames);
        allSuggestions = [... new Set(allSuggestions)];

        return exclusiveResultList(allSuggestions);
    }

    return null;
}
