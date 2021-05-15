import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag } from '../../tagManager';

const MarkdownCompletionItems: CompletionItem[] = [
	{ label: 'indent', kind: CompletionItemKind.Text }
];

const Markdown: IAntlersTag = {
	tagName: 'markdown',
	hideFromCompletions: false,
	injectParentScope: false,
	requiresClose: true,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	parameters: [],
	resolveCompletionItems: (params: ISuggestionRequest) => {
		if (params.isPastTagPart == false && (params.leftWord == 'markdown' || params.leftWord == '/markdown') && params.leftChar == ':') {
			return exclusiveResult(MarkdownCompletionItems);
		}

		return EmptyCompletionResult;
	}
};

export default Markdown;
