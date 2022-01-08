import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { Scope } from '../../scope/scope';

export function augmentSplitScope(node: AntlersNode, scope: Scope): Scope {
	const itemsScope = scope.copy();

	scope.addScopeList('items', itemsScope);

	return scope;
}