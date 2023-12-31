import { AntlersNode } from '../../nodes/abstractNode.js';
import { AntlersDocument } from '../antlersDocument.js';
import { TransformOptions } from '../transformOptions.js';
import { NodePrinter } from './nodePrinter.js';

export class AntlersPrinter {
    static printNode(node: AntlersNode, document: AntlersDocument, options: TransformOptions) {
        if (node.originalNode != null) {
            node = node.originalNode;
        }

        const result = NodePrinter.prettyPrintNode(node, document, 0, options, null, null);

        return node.rawStart + ' ' + result + ' ' + node.rawEnd;
    }
}