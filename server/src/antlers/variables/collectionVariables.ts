import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IScopeVariable } from '../scope/types';

export function makeCollectionVariables(node: AntlersNode): IScopeVariable[] {
    return [
        { name: 'no_results', dataType: 'boolean', sourceField: null, sourceName: '*internal.collection.context', introducedBy: node },
        { name: 'total_results', dataType: 'integer', sourceField: null, sourceName: '*internal.collection.context', introducedBy: node }
    ];
}
