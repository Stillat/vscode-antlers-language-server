import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IScopeVariable } from '../scope/types.js';

export function makeUserPermissionsVariables(node: AntlersNode): IScopeVariable[] {
    return [
        { name: 'no_results', dataType: 'boolean', sourceField: null, sourceName: '*internal.user.permissions', introducedBy: node },
        { name: 'total_results', dataType: 'integer', sourceField: null, sourceName: '*internal.user.permissions', introducedBy: node },
        { name: 'handle', dataType: 'string', sourceField: null, sourceName: '*internal.user.permissions', introducedBy: node }
    ];
}
