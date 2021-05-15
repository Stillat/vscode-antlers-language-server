import { Scope } from '../../../scope/engine';
import { IAntlersTag } from '../../../tagManager';
import { ISymbol } from '../../../types';
import { makeRoutableVariables } from '../../../variables/routeableVariables';

const NavBreadcrumbs: IAntlersTag = {
	tagName: 'nav:breadcrumbs',
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	requiresClose: true,
	hideFromCompletions: false,
	injectParentScope: false,
	parameters: [
		{
			name: 'include_home',
			description: 'Whether to include the home page in the first level',
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: false,
			expectsTypes: ['boolean'],
			isDynamic: false,
			isRequired: false
		},
		{
			name: 'reverse',
			description: 'Whether to reverse the order of links',
			acceptsVariableInterpolation: false,
			allowsVariableReference: false,
			aliases: [],
			expectsTypes: ['boolean'],
			isRequired: false,
			isDynamic: false
		},
		{
			name: 'trim',
			description: 'Whether to trim the whitespace after each iteration of the loop',
			acceptsVariableInterpolation: false,
			allowsVariableReference: false,
			aliases: [],
			expectsTypes: ['boolean'],
			isDynamic: false,
			isRequired: false
		}
	],
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		scope.addVariables([
			{ name: 'is_current', dataType: 'boolean', sourceName: '*internal.nav.breadcrumbs', sourceField: null, introducedBy: symbol },
		]);

		scope.addVariables(makeRoutableVariables(symbol));

		return scope;
	}
};

export default NavBreadcrumbs;
