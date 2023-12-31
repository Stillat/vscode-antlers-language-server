import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IScopeVariable } from '../scope/types.js';

export function makeReplicatorVariables(symbol: AntlersNode): IScopeVariable[] {
    return [
        { name: 'type', dataType: 'string', sourceName: '*internal.replicator', sourceField: null, introducedBy: symbol },
    ];
}
