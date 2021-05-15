import { blueprintFieldsToScopeVariables, Scope } from '../../scope/engine';
import { IAntlersTag } from '../../tagManager';
import { ISymbol } from '../../types';
import { makeFieldsVariables } from '../../variables/forms/fieldsVariables';
import { createDefinitionAlias } from '../alias';
import { returnDynamicParameter } from '../dynamicParameterResolver';

const UserRegister: IAntlersTag = {
	tagName: 'user:register_form',
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
			description: 'Where the user should be redirected after registering',
			expectsTypes: ['string'],
			isDynamic: false,
			isRequired: false
		},
		{
			name: 'error_redirect',
			acceptsVariableInterpolation: false,
			aliases: [],
			allowsVariableReference: true,
			description: 'Where the user should be redirected after failed registration attempts',
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
		scope.addVariableArray('fields', makeFieldsVariables(symbol));
		scope.addVariable({ name: 'errors', dataType: 'array', sourceName: '*internal.user.register_form', sourceField: null, introducedBy: symbol });
		scope.addVariable({ name: 'old', dataType: 'array', sourceName: '*internal.user.register_form', sourceField: null, introducedBy: symbol });
		scope.addVariable({ name: 'error', dataType: 'array', sourceName: '*internal.user.register_form', sourceField: null, introducedBy: symbol });
		scope.addVariable({ name: 'success', dataType: 'string', sourceName: '*internal.user.register_form', sourceField: null, introducedBy: symbol });

		const userFields = scope.statamicProject.getUserFields();

		if (userFields.length > 0) {
			const userFormFields = blueprintFieldsToScopeVariables(symbol, userFields);

			scope.addVariableArray('old', userFormFields);
			scope.addVariableArray('error', userFormFields);
		}

		return scope;
	}
};

const MemberRegister = createDefinitionAlias(UserRegister, 'member:register_form');

export { UserRegister, MemberRegister };
