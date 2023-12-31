import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { Scope } from '../../scope/scope.js';

export function augmentSplitScope(node: AntlersNode, scope: Scope): Scope {
    const itemsScope = scope.copy();

    scope.addScopeList('items', itemsScope);

    return scope;
}