import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IScopeVariable } from '../scope/types.js';

export function makeLocaleVariables(node: AntlersNode): IScopeVariable[] {
    return [
        { name: 'url', dataType: 'string', sourceField: null, sourceName: '*internal.locale', introducedBy: node },
        { name: 'name', dataType: 'string', sourceField: null, sourceName: '*internal.locale', introducedBy: node },
    ];
}
