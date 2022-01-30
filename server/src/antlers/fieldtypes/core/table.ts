import { IFieldtypeInjection } from '../../../projects/fieldsets/fieldtypeInjection';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { Scope } from '../../scope/scope';

const TableFieldtype: IFieldtypeInjection = {
    name: 'table',
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        scope.addVariable({ name: 'cells', dataType: 'array', sourceName: '*internal.fieldtype.table', sourceField: null, introducedBy: symbol });
    }
};

export default TableFieldtype;
