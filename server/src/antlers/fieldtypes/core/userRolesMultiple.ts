import { Scope } from '../../scope/engine';
import { ISymbol } from '../../types';
import { makeArrayVariables } from '../../variables/arrayVariables';
import { makeLoopVariables } from '../../variables/loopVariables';
import { IFieldtypeInjection } from '../fieldtypeManager';

const UserRolesMultipleFieldtype: IFieldtypeInjection = {
	name: 'user_roles_multiple',
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		scope.addVariables(makeArrayVariables(symbol));
		scope.addVariables(makeLoopVariables(symbol));
	}
};

export default UserRolesMultipleFieldtype;
