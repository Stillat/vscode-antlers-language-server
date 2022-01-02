import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IScopeVariable } from '../scope/types';

export function makeRoutableVariables(node: AntlersNode): IScopeVariable[] {
    return [
        { name: 'title', dataType: 'string', sourceField: null, sourceName: '*internal.routeable', introducedBy: node },
        { name: 'url', dataType: 'string', sourceField: null, sourceName: '*internal.routeable', introducedBy: node },
    ];
}
