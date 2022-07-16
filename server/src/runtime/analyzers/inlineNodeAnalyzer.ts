import { AbstractNode, AntlersNode, EscapedContentNode, LiteralNode } from '../nodes/abstractNode';
import { StringUtilities } from '../utilities/stringUtilities';

export class InlineNodeAnalyzer {
    static analyze(nodes: AbstractNode[]) {
        nodes.forEach((node) => {
            if (node instanceof AntlersNode) {
                if (node.prev instanceof AntlersNode && node.isPaired() && node.prev.isInlineAntlers == true) {
                    node.isInlineAntlers = false;
                    if (node.isClosedBy != null) {
                        node.isClosedBy.isInlineAntlers = false;
                    }
                    return;
                }

                let isRightInline = false,
                    isLeftInline = false;

                if (node.next == null) {
                    isRightInline = true;
                } else if (node.next instanceof LiteralNode) {
                    const firstLine = StringUtilities.getFirstLine(node.next.content);

                    if (node.next.next == null && firstLine.trim().length == 0) {
                        isRightInline = true;
                    } else {
                        if (StringUtilities.trimLeft(firstLine, " \t").startsWith("\n") == false && firstLine.trim().length > 0) {
                            isRightInline = true;
                        } else if (node.next.next instanceof EscapedContentNode) {
                            isRightInline = true;
                        } else if (node.next.next instanceof AntlersNode) {
                            if (node.next.next.isPaired() == false) {
                                isRightInline = true;
                            } else {
                                if ((node.next.next.startPosition?.line ?? 0) != (node.startPosition?.line ?? 0)) {
                                    isRightInline = true;
                                }
                            }
                        }
                    }
                } else if (node.next instanceof AntlersNode) {
                    if (node.next.isPaired()) {
                        isRightInline = true;
                    }
                }

                if (node.prev == null) {
                    isLeftInline = true;
                } else if (node.prev instanceof LiteralNode) {
                    const lastLine = StringUtilities.getLastLine(node.prev.content);

                    if (StringUtilities.trimRight(lastLine, " \t").endsWith("\n") == false && lastLine.trim().length > 0) {
                        isLeftInline = true;
                    } else if (node.prev.prev instanceof EscapedContentNode) {
                        isLeftInline = true;
                    } else if (node.prev.prev instanceof AntlersNode) {
                        if (node.prev.prev.isInlineAntlers) {
                            isLeftInline = true;
                        } else {
                            if (node.prev.prev.isClosingTag && node.prev.prev.isOpenedBy != null) {
                                if (node.prev.prev.isOpenedBy instanceof EscapedContentNode || node.prev.prev.runtimeName() == 'noparse') {
                                    node.prev.prev.isInlineAntlers = true;
                                    isLeftInline = true;
                                }
                            }
                        }
                    }
                } else if (node.prev instanceof AntlersNode) {
                    if (node.prev.isPaired()) {
                        isLeftInline = true;
                    }
                }

                node.isInlineAntlers = (isRightInline && isLeftInline);
            }
        });
    }
}