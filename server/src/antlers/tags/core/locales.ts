import { Scope } from '../../scope/engine';
import { IAntlersTag } from '../../tagManager';
import { ISymbol } from '../../types';
import { makeLocaleVariables } from '../../variables/localeVariables';

const Locales: IAntlersTag = {
	tagName: 'locales',
	hideFromCompletions: false,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	injectParentScope: false,
	requiresClose: true,
	parameters: [
		{
			isRequired: false,
			name: 'id',
			description: 'The ID of the content to localize',
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: false,
			expectsTypes: ['string'],
			isDynamic: false
		},
		{
			isRequired: false,
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: false,
			name: 'sort',
			description: 'Sort by a sites key',
			expectsTypes: ['string'],
			isDynamic: false
		},
		{
			isRequired: false,
			name: 'current_first',
			description: 'When true, ensures that the current locale is first',
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: false,
			expectsTypes: ['boolean'],
			isDynamic: false,
		}
	],
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		scope.addVariableArray('locale', makeLocaleVariables(symbol));

		return scope;
	}
};

export default Locales;
