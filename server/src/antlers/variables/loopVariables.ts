import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IScopeVariable } from '../scope/types.js';

export function makeLoopVariables(symbol: AntlersNode): IScopeVariable[] {
    return [
        { name: 'first', dataType: 'boolean', sourceField: null, sourceName: '*internal.loop', introducedBy: symbol },
        { name: 'last', dataType: 'boolean', sourceField: null, sourceName: '*internal.loop', introducedBy: symbol },
        { name: 'count', dataType: 'integer', sourceField: null, sourceName: '*internal.loop', introducedBy: symbol },
        { name: 'index', dataType: 'integer', sourceField: null, sourceName: '*internal.loop', introducedBy: symbol },
        { name: 'order', dataType: 'integer', sourceField: null, sourceName: '*internal.loop', introducedBy: symbol },
    ];
}
