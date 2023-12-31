import { CompletionItem } from 'vscode-languageserver-types';
import { IProjectDetailsProvider } from '../../projects/projectDetailsProvider.js';
import { createSuggestionsFromDotStrings } from './dotStringCompletions.js';

export function getTranslationSuggestions(currentValue: string, project: IProjectDetailsProvider): CompletionItem[] {
    return createSuggestionsFromDotStrings(currentValue, project.getTranslationKeys());
}
