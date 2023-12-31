import { IFieldtypeInjection } from '../../../projects/fieldsets/fieldtypeInjection.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { Scope } from '../../scope/scope.js';

const TableFieldtype: IFieldtypeInjection = {
    name: 'table',
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        scope.addVariable({ name: 'cells', dataType: 'array', sourceName: '*internal.fieldtype.table', sourceField: null, introducedBy: symbol });
    }
};

export default TableFieldtype;
