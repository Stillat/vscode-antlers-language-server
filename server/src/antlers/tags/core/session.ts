import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { SessionVariableManager } from '../../../references/sessionVariableManager';
import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { IScopeVariable, Scope } from '../../scope/engine';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag } from '../../tagManager';
import { getParameter, ISymbol } from '../../types';

const SessionTagCompletionItems: CompletionItem[] = [
	{ label: 'set', kind: CompletionItemKind.Text },
	{ label: 'flash', kind: CompletionItemKind.Text },
	{ label: 'forget', kind: CompletionItemKind.Text },
	{ label: 'flush', kind: CompletionItemKind.Text },
];

export class SessionVariableContext {
	symbol: ISymbol;

	constructor(symbol: ISymbol) {
		this.symbol = symbol;
	}
}

const SessionTag: IAntlersTag = {
	tagName: 'session',
	requiresClose: false,
	allowsContentClose: true,
	allowsArbitraryParameters: false,
	hideFromCompletions: false,
	injectParentScope: false,
	parameters: [
		{
			name: 'as',
			description: 'An optional alias for the session data',
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: false,
			expectsTypes: ['string'],
			isDynamic: false,
			isRequired: false
		}
	],
	resolveCompletionItems: (params: ISuggestionRequest) => {
		if (params.isPastTagPart == false && (params.leftWord == 'session' || params.leftWord == '/session') && params.leftChar == ':') {
			const knownSessionVars = SessionVariableManager.getKnownSessionVariableNames();
			let sessionCompletions: CompletionItem[] = [];

			sessionCompletions = sessionCompletions.concat(SessionTagCompletionItems);

			for (let i = 0; i < knownSessionVars.length; i++) {
				sessionCompletions.push({
					label: knownSessionVars[i],
					kind: CompletionItemKind.Variable
				});
			}

			return exclusiveResult(sessionCompletions);
		}

		return EmptyCompletionResult;
	},
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		const asParam = getParameter('as', symbol),
			knownParams: string[] = SessionVariableManager.getKnownSessionVariableNames(),
			scopeVariables: IScopeVariable[] = [];

		for (let i = 0; i < knownParams.length; i++) {
			scopeVariables.push({
				dataType: '*',
				name: knownParams[i],
				sourceField: null,
				sourceName: 'project.session',
				introducedBy: symbol
			});
		}

		if (asParam == null) {
			scope.addVariables(scopeVariables);
		} else {
			scope.addVariableArray(asParam.value, scopeVariables);
		}

		return scope;
	}
};

export default SessionTag;
