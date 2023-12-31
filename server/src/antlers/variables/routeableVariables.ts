import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IScopeVariable } from '../scope/types.js';

export function makeRoutableVariables(node: AntlersNode): IScopeVariable[] {
    return [
        { name: 'title', dataType: 'string', sourceField: null, sourceName: '*internal.routeable', introducedBy: node },
        { name: 'url', dataType: 'string', sourceField: null, sourceName: '*internal.routeable', introducedBy: node },
    ];
}
