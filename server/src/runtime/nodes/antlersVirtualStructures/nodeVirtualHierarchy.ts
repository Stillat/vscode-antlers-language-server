import { AntlersNode } from '../abstractNode';

export class NodeVirtualHierarchy {
    private node: AntlersNode;

    constructor(node: AntlersNode) {
        this.node = node;
    }

    findParentWithName(name: string): AntlersNode | null {
        const parser = this.node.getParser();

        if (parser == null) {
            return null;
        }

        return parser.structure.findParentWithName(name, this.node);
    }
}
