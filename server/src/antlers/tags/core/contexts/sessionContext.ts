import { AntlersNode } from '../../../../runtime/nodes/abstractNode.js';

export class SessionVariableContext {
    node: AntlersNode;

    constructor(node: AntlersNode) {
        this.node = node;
    }
}