import { AbstractNode, AntlersNode, LiteralNode } from '../nodes/abstractNode';
import { StringUtilities } from '../utilities/stringUtilities';

export class InlineNodeAnalyzer {
    static analyze(nodes: AbstractNode[]) {
        nodes.forEach((node) => {
            if (node instanceof AntlersNode) {
                let isRightInline = false,
                    isLeftInline = false;

                if (node.next == null) {
                    isRightInline = true;
                } else if (node.next instanceof LiteralNode) {
                    const firstLine = StringUtilities.getFirstLine(node.next.content);

                    if (StringUtilities.trimLeft(firstLine, " \t").startsWith("\n") == false && firstLine.trim().length > 0) {
                        isRightInline = true;
                    }
                }

                if (node.prev == null) {
                    isLeftInline = true;
                } else if (node.prev instanceof LiteralNode) {
                    const lastLine = StringUtilities.getLastLine(node.prev.content);

                    if (StringUtilities.trimRight(lastLine, " \t").endsWith("\n") == false && lastLine.trim().length > 0) {
                        isLeftInline = true;
                    }
                }

                node.isInlineAntlers = (isRightInline && isLeftInline);
            }
        });
    }
}