import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { formatSuggestionList } from '../../../suggestions/fieldFormatter';
import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { Scope } from '../../scope/engine';
import { EmptyCompletionResult, exclusiveResult, IAntlersParameter, IAntlersTag } from '../../tagManager';
import { ISymbol } from '../../types';

const UserTagCompletionItems: CompletionItem[] = [
	{ label: 'is', kind: CompletionItemKind.Text },
	{ label: 'not_in', kind: CompletionItemKind.Text },
	{ label: 'in', kind: CompletionItemKind.Text },
	{ label: 'isnt', kind: CompletionItemKind.Text },
	{ label: 'profile', kind: CompletionItemKind.Text },
	{ label: 'can', kind: CompletionItemKind.Text },
	{ label: 'forgot_password_form', kind: CompletionItemKind.Text },
	{ label: 'logout', kind: CompletionItemKind.Text },
	{ label: 'login_form', kind: CompletionItemKind.Text },
	{ label: 'logout_url', kind: CompletionItemKind.Text },
	{ label: 'register_form', kind: CompletionItemKind.Text },
	{ label: 'reset_password_form', kind: CompletionItemKind.Text },
];

const User: IAntlersTag = {
	tagName: 'user',
	hideFromCompletions: false,
	requiresClose: true,
	injectParentScope: false,
	allowsContentClose: false,
	allowsArbitraryParameters: false,
	parameters: [],
	resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
		if (params.isPastTagPart == false && params.currentSymbol != null && params.currentSymbol.methodName != null && params.currentSymbol.methodName == 'profile') {
			if (parameter.name == 'field') {
				return exclusiveResult(formatSuggestionList(params.project.getUserFields()));
			}
		}

		return EmptyCompletionResult;
	},
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		if (symbol.methodName == null || symbol.methodName == '' || symbol.methodName == 'profile') {
			scope.injectUserFields(symbol);
		}

		return scope;
	},
	resolveCompletionItems: (params: ISuggestionRequest) => {
		if ((params.leftWord == 'user' || params.leftWord == '/user' ||
			params.leftWord == 'member' || params.leftWord == '/member') && params.leftChar == ':') {
			return exclusiveResult(UserTagCompletionItems);
		}

		return EmptyCompletionResult;
	}
};

export default User;
