import { CompletionItem } from 'vscode-languageserver-types';
import { StatamicProject } from '../../projects/statamicProject';
import { createSuggestionsFromDotStrings } from './dotStringCompletions';

export function getTranslationSuggestions(currentValue: string, project: StatamicProject): CompletionItem[] {
	return createSuggestionsFromDotStrings(currentValue, project.getTranslationKeys());
}
