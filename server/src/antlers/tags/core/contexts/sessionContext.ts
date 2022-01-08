import { AntlersNode } from '../../../../runtime/nodes/abstractNode';

export class SessionVariableContext {
    node: AntlersNode;

    constructor(node: AntlersNode) {
        this.node = node;
    }
}