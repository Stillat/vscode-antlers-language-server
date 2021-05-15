import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { makeValueSuggestion } from '../../../../suggestions/fieldFormatter';
import { ISuggestionRequest } from '../../../../suggestions/suggestionManager';
import { EmptyCompletionResult, IAntlersTag, nonExclusiveResult } from '../../../tagManager';
import { resolveFormParameterCompletions } from './parameterCompletions';

const FormCompletions: CompletionItem[] = [
	{ label: 'set', kind: CompletionItemKind.Text },
	{ label: 'create', kind: CompletionItemKind.Text },
	{ label: 'errors', kind: CompletionItemKind.Text },
	{ label: 'success', kind: CompletionItemKind.Text },
	{ label: 'submissions', kind: CompletionItemKind.Text },
	{ label: 'submission', kind: CompletionItemKind.Text },
];

const FormTag: IAntlersTag = {
	tagName: 'form',
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	requiresClose: true,
	hideFromCompletions: false,
	injectParentScope: false,
	parameters: [

	],
	resovleParameterCompletionItems: resolveFormParameterCompletions,
	resolveCompletionItems: (params: ISuggestionRequest) => {
		let items: CompletionItem[] = [];

		if (params.isPastTagPart == false && (params.leftWord == 'form' || params.leftWord == '/form') &&
			params.leftChar == ':') {
			const formNames = params.project.getUniqueFormNames();

			items = items.concat(FormCompletions);

			for (let i = 0; i < formNames.length; i++) {
				items.push({
					label: formNames[i],
					kind: CompletionItemKind.Field
				});
			}

			return nonExclusiveResult(items);
		}

		return EmptyCompletionResult;
	}
};

export default FormTag;
