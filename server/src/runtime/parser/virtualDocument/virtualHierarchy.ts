import { AntlersNode } from '../../nodes/abstractNode';
import { DocumentParser } from "../documentParser";

export class VirtualHierarchy {
    private parser: DocumentParser;

    constructor(parser: DocumentParser) {
        this.parser = parser;
    }

    findParentWithName(name: string, anchor: AntlersNode): AntlersNode | null {
        let currentParent = anchor.parent;

        while (currentParent != null) {
            if (currentParent instanceof AntlersNode && currentParent.nameMatches(name)) {
                return currentParent;
            }

            if (currentParent.parent == currentParent) {
                break;
            }

            currentParent = currentParent.parent;
        }

        return null;
    }
}
