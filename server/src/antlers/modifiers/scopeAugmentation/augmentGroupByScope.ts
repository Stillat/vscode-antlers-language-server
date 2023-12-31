import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { Scope } from '../../scope/scope.js';

export function augmentGroupByScope(node: AntlersNode, scope: Scope): Scope {
    const iterableItems = scope.copy(),
        groupScope = scope.copy();

    groupScope.addVariable({ sourceName: '*internal.group_by', sourceField: null, dataType: 'string', name: 'group', introducedBy: node });
    groupScope.addVariable({ sourceName: '*internal.group_by', sourceField: null, dataType: 'string', name: 'key', introducedBy: node });
    groupScope.addScopeList('items', iterableItems);

    scope.addScopeList('groups', groupScope);

    return scope;
}