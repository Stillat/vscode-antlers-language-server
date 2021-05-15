import { Scope } from '../../scope/engine';
import { ISymbol } from '../../types';
import { makeArrayVariables } from '../../variables/arrayVariables';
import { makeLoopVariables } from '../../variables/loopVariables';
import { makeTermVariables } from '../../variables/termVariables';
import { IFieldtypeInjection } from '../fieldtypeManager';

const TaxonomiesMultipleFieldtype: IFieldtypeInjection = {
	name: 'taxonomies_multiple',
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		scope.addVariables(makeArrayVariables(symbol));
		scope.addVariables(makeLoopVariables(symbol));
		scope.addVariables(makeTermVariables(symbol));
	}
};

export default TaxonomiesMultipleFieldtype;
