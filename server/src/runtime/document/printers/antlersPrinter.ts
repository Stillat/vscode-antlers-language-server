import { AntlersNode } from '../../nodes/abstractNode';
import { AntlersDocument } from '../antlersDocument';
import { TransformOptions } from '../transformOptions';
import { NodePrinter } from './nodePrinter';

export class AntlersPrinter {
    static printNode(node: AntlersNode, document: AntlersDocument, options: TransformOptions) {
        if (node.originalNode != null) {
            node = node.originalNode;
        }

        const result = NodePrinter.prettyPrintNode(node, document, 0, options, null, null);

        return node.rawStart + ' ' + result + ' ' + node.rawEnd;
    }
}