import { ParameterNode } from '../../nodes/abstractNode.js';
import { Position } from '../../nodes/position.js';

export class ParameterContext {
    public parameter: ParameterNode | null = null;
    public isInName = false;
    public isInValue = false;

    static resolveContext(position: Position, node: ParameterNode) {
        const context = new ParameterContext();

        context.parameter = node;

        if (position.isWithinRange(node.namePosition)) {
            context.isInName = true;
        } else if (position.isWithinRange(node.valuePosition)) {
            context.isInValue = true;
        }

        return context;
    }
}