import { IScopeVariable, Scope } from '../../scope/engine';
import { IAntlersTag } from '../../tagManager';
import { ISymbol } from '../../types';
import { createDefinitionAlias } from '../alias';
import { returnDynamicParameter } from '../dynamicParameterResolver';

function makeUserLoginFields(symbol: ISymbol): IScopeVariable[] {
	return [
		{ name: 'email', dataType: 'string', sourceName: '*internal.user.login', sourceField: null, introducedBy: symbol },
		{ name: 'password', dataType: 'string', sourceName: '*internal.user.login', sourceField: null, introducedBy: symbol },
	];
}

const UserLoginForm: IAntlersTag = {
	tagName: 'user:login_form',
	allowsArbitraryParameters: true,
	allowsContentClose: false,
	requiresClose: true,
	hideFromCompletions: false,
	injectParentScope: false,
	parameters: [
		{
			name: 'redirect',
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: true,
			description: 'Where the user should be redirected after logging in',
			expectsTypes: ['string'],
			isDynamic: false,
			isRequired: false
		},
		{
			name: 'error_redirect',
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: true,
			description: 'Where the user should be redirected after failed login attempts',
			expectsTypes: ['string'],
			isDynamic: false,
			isRequired: false
		},
		{
			name: 'allow_request_redirect',
			description: 'Indicates if query parameters can override the redirect and error_redirect parameters',
			acceptsVariableInterpolation: false,
			allowsVariableReference: true,
			aliases: [],
			expectsTypes: ['boolean'],
			isDynamic: false,
			isRequired: false
		}
	],
	resolveDynamicParameter: returnDynamicParameter,
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		scope.addVariables([
			{ name: 'errors', dataType: 'array', sourceName: '*internal.user.login', sourceField: null, introducedBy: symbol },
			{ name: 'success', dataType: 'string', sourceName: '*internal.user.login', sourceField: null, introducedBy: symbol },
		]);

		scope.addVariables(makeUserLoginFields(symbol));

		scope.addVariableArray('old', makeUserLoginFields(symbol));
		scope.addVariableArray('error', makeUserLoginFields(symbol));

		return scope;
	}
};

const MemberLoginForm = createDefinitionAlias(UserLoginForm, 'member:login_form');

export { UserLoginForm, MemberLoginForm };
