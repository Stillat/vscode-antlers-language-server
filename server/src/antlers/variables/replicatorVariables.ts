import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IScopeVariable } from '../scope/types';

export function makeReplicatorVariables(symbol: AntlersNode): IScopeVariable[] {
    return [
        { name: 'type', dataType: 'string', sourceName: '*internal.replicator', sourceField: null, introducedBy: symbol },
    ];
}
