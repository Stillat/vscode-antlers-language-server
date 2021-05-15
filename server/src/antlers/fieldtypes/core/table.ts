import { Scope } from '../../scope/engine';
import { ISymbol } from '../../types';
import { IFieldtypeInjection } from '../fieldtypeManager';

const TableFieldtype: IFieldtypeInjection = {
	name: 'table',
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		scope.addVariable({ name: 'cells', dataType: 'array', sourceName: '*internal.fieldtype.table', sourceField: null, introducedBy: symbol });
	}
};

export default TableFieldtype;
