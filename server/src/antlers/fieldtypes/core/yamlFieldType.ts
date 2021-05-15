import { Scope } from '../../scope/engine';
import { ISymbol } from '../../types';
import { makeArrayVariables } from '../../variables/arrayVariables';
import { makeLoopVariables } from '../../variables/loopVariables';
import { IFieldtypeInjection } from '../fieldtypeManager';

const YamlFieldtype: IFieldtypeInjection = {
	name: 'yaml',
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		scope.addVariables(makeArrayVariables(symbol));
		scope.addVariables(makeLoopVariables(symbol));
	}
};

export default YamlFieldtype;
