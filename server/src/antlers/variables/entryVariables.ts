import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IScopeVariable } from '../scope/types';

export function makeEntryVariables(node: AntlersNode): IScopeVariable[] {
    return [
        { name: 'collection', dataType: 'string', sourceName: '*internal.entry', sourceField: null, introducedBy: node },
        { name: 'date', dataType: 'string', sourceName: '*internal.entry', sourceField: null, introducedBy: node },
        { name: 'datestamp', dataType: 'number', sourceName: '*internal.entry', sourceField: null, introducedBy: node },
        { name: 'datestring', dataType: 'string', sourceName: '*internal.entry', sourceField: null, introducedBy: node },
        { name: 'has_timestamp', dataType: 'boolean', sourceName: '*internal.entry', sourceField: null, introducedBy: node },
        { name: 'is_entry', dataType: 'boolean', sourceName: '*internal.entry', sourceField: null, introducedBy: node },
        { name: 'order', dataType: 'number', sourceName: '*internal.entry', sourceField: null, introducedBy: node },
        { name: 'order_type', dataType: 'string', sourceName: '*internal.entry', sourceField: null, introducedBy: node },
        { name: 'timestamp', dataType: 'number', sourceName: '*internal.entry', sourceField: null, introducedBy: node },

    ];
}