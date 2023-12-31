import { AntlersDocument } from "../runtime/document/antlersDocument.js";
import { AntlersNode } from '../runtime/nodes/abstractNode.js';

export function getScopeName(node: AntlersNode): string | null {
    return node.findParameterValueOrNull("scope");
}

export function resolveTypedTree(document: AntlersDocument) {
    const docNodes = document.getAllNodes();

    docNodes.forEach((node) => {
        if (node instanceof AntlersNode) {
            if (node.manifestType === "array") {
                node.mustClose = true;
            }
        }
    });
}
