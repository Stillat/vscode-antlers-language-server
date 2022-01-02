import { CompletionItem } from 'vscode-languageserver-types';
import { IProjectDetailsProvider } from '../../projects/projectDetailsProvider';
import { createSuggestionsFromDotStrings } from './dotStringCompletions';

export function getTranslationSuggestions(currentValue: string, project: IProjectDetailsProvider): CompletionItem[] {
    return createSuggestionsFromDotStrings(currentValue, project.getTranslationKeys());
}
