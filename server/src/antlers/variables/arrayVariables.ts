import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IScopeVariable } from '../scope/types.js';

export function makeArrayVariables(symbol: AntlersNode): IScopeVariable[] {
    return [
        { sourceName: '*internal.array', sourceField: null, dataType: '*', name: 'value', introducedBy: symbol },
        { sourceName: '*internal.array', sourceField: null, dataType: '*', name: 'key', introducedBy: symbol }
    ];
}
