import { AntlersNode, AntlersParserFailNode } from '../../nodes/abstractNode.js';
import { AntlersDocument } from '../antlersDocument.js';

export class RangeScanner {
    private doc: AntlersDocument;

    constructor(doc: AntlersDocument) {
        this.doc = doc;
    }

    getAllSelfClosingNodes() {
        const nodes: AntlersNode[] = [];

        this.doc.getAllNodes().forEach((node) => {
            if (node instanceof AntlersNode) {
                if (node.isSelfClosing) {
                    nodes.push(node);
                }
            }
        });

        return nodes;
    }

    getAllPairedNodes() {
        // Iterates all of the nodes to find any that are paired.
        // We will only add the opening tag to our return value.
        const nodes: AntlersNode[] = [];

        this.doc.getAllNodes().forEach((node) => {
            if (node instanceof AntlersNode || node instanceof AntlersParserFailNode) {
                if (node.isClosedBy != null && !node.isSelfClosing) {
                    nodes.push(node);
                }
            }
        });

        return nodes;
    }
}