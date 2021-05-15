import { IScopeVariable, Scope } from '../../scope/engine';
import { IAntlersTag } from '../../tagManager';
import { ISymbol } from '../../types';
import { createDefinitionAlias } from '../alias';
import { returnDynamicParameter } from '../dynamicParameterResolver';

const UserPasswordReset: IAntlersTag = {
	tagName: 'user:reset_password_form',
	allowsArbitraryParameters: true,
	allowsContentClose: false,
	requiresClose: true,
	hideFromCompletions: false,
	injectParentScope: false,
	parameters: [
		{
			name: 'redirect',
			description: 'Where the user should be taken after submitting the form',
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: true,
			expectsTypes: ['string'],
			isDynamic: false,
			isRequired: false
		}
	],
	resolveDynamicParameter: returnDynamicParameter,
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		scope.addVariables([
			{ name: 'success', dataType: 'boolean', sourceField: null, sourceName: '*internal.user.password_reset', introducedBy: symbol },
			{ name: 'url_invalid', dataType: 'boolean', sourceField: null, sourceName: '*internal.user.password_reset', introducedBy: symbol },
			{ name: 'errors', dataType: 'array', sourceField: null, sourceName: '*internal.user.password_reset', introducedBy: symbol },
		]);

		return scope;
	}
};

const MemberPasswordReset = createDefinitionAlias(UserPasswordReset, 'member:reset_password_form');

export { UserPasswordReset, MemberPasswordReset };
