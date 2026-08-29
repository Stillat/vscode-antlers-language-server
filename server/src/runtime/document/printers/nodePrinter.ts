import { formatAntlers } from '../../../test/testUtils/formatAntlers.js';
import { replaceAllInString } from '../../../utils/strings.js';
import { AbstractNode, AdditionOperator, AntlersNode, ArgSeparator, DivisionOperator, InlineBranchSeparator, InlineTernarySeparator, LeftAssignmentOperator, LogicalAndOperator, LogicalNegationOperator, LogicalOrOperator, LogicGroupBegin, LogicGroupEnd, MethodInvocationNode, ModifierNameNode, ModifierSeparator, ModifierValueNode, ModifierValueSeparator, ModulusOperator, MultiplicationOperator, NumberNode, PathNode, ScopeAssignmentOperator, StatementSeparatorNode, StringValueNode, SubtractionOperator, TupleListStart, VariableNode } from '../../nodes/abstractNode.js';
import { LanguageParser } from '../../parser/languageParser.js';
import { NodeHelpers } from '../../utilities/nodeHelpers.js';
import { AntlersDocument } from '../antlersDocument.js';
import { TransformOptions } from '../transformOptions.js';
import { NodeBuffer } from './nodeBuffer.js';

export class NodePrinter {

    /**
     * Splits a variable name into its leading array brackets, its actual
     * name, and its trailing array brackets.
     *
     * Array brackets are merged into neighboring variable names whenever they
     * are not separated by whitespace, which makes ['one', two] produce the
     * variable names "[" and "two]".
     *
     * Returns null when the name contains no brackets, or contains brackets
     * in a position this printer does not manage.
     */
    private static splitArrayBrackets(name: string): ArrayBracketParts | null {
        const leading = (/^\[+/.exec(name) ?? [''])[0],
            trailing = (/\]+$/.exec(name) ?? [''])[0];

        if (leading.length == 0 && trailing.length == 0) { return null; }

        const value = name.substring(leading.length, name.length - trailing.length);

        if (value.includes('[') || value.includes(']')) { return null; }

        return {
            openCount: leading.length,
            value: value,
            closeCount: trailing.length
        };
    }

    /**
     * Produces the wrapping decision for every array literal within the
     * provided nodes, keyed by the node and bracket it belongs to.
     *
     * Brackets are numbered per node: the opening brackets of a name come
     * first, followed by its closing brackets.
     */
    private static resolveArrayWrapping(lexerNodes: AbstractNode[], options: TransformOptions): Map<string, ArrayWrapLayout> {
        const decisions: Map<string, ArrayWrapLayout> = new Map(),
            openBrackets: ArrayBracket[] = [],
            indentUnit = options.insertSpaces
                ? ' '.repeat(options.tabSize)
                : '\t';

        for (let i = 0; i < lexerNodes.length; i++) {
            const node = lexerNodes[i],
                line = node.startPosition?.line ?? 0;

            if (!(node instanceof VariableNode)) {
                NodePrinter.markArrayItems(openBrackets);
                continue;
            }

            const parts = NodePrinter.splitArrayBrackets(node.name);

            if (parts == null) {
                NodePrinter.markArrayItems(openBrackets);
                continue;
            }

            for (let b = 0; b < parts.openCount; b++) {
                NodePrinter.markArrayItems(openBrackets);

                openBrackets.push({
                    key: NodePrinter.bracketKey(i, b),
                    line: line,
                    hasItems: false,
                    depth: openBrackets.length + 1
                });
            }

            if (parts.value.length > 0) {
                NodePrinter.markArrayItems(openBrackets);
            }

            for (let b = 0; b < parts.closeCount; b++) {
                const bracket = openBrackets.pop();

                if (bracket == null) { continue; }

                const wrap = bracket.hasItems && line > bracket.line,
                    closeKey = NodePrinter.bracketKey(i, parts.openCount + b);

                const layout: ArrayWrapLayout = {
                    wrap: wrap,
                    itemIndent: indentUnit.repeat(bracket.depth),
                    closeIndent: indentUnit.repeat(Math.max(0, bracket.depth - 1))
                };

                decisions.set(bracket.key, layout);
                decisions.set(closeKey, layout);
            }
        }

        return decisions;
    }

    private static markArrayItems(openBrackets: ArrayBracket[]) {
        openBrackets.forEach((bracket) => {
            bracket.hasItems = true;
        });
    }

    private static hasLineBreakAfter(node: AbstractNode, nextNode: AbstractNode, doc: AntlersDocument): boolean {
        const endIndex = node.endPosition?.index,
            nextIndex = nextNode.startPosition?.index;

        if (endIndex == null || nextIndex == null) {
            return (nextNode.startPosition?.line ?? 0) > (node.endPosition?.line ?? 0);
        }

        return doc.getOriginalContent()
            .substring(endIndex + 1, Math.max(endIndex + 1, nextIndex + 1))
            .includes("\n");
    }

    private static bracketKey(nodeIndex: number, bracketIndex: number): string {
        return nodeIndex + ':' + bracketIndex;
    }

    private static sourceContent(node: AbstractNode, doc: AntlersDocument): string {
        const startIndex = node.startPosition?.index,
            endIndex = node.endPosition?.index;

        if (startIndex == null || endIndex == null) {
            return '';
        }

        return doc.getOriginalContent().substring(startIndex, endIndex + 1).trim();
    }

    private static isAdjacentArrayAccessor(previous: VariableNode, current: VariableNode): boolean {
        const previousEnd = previous.endPosition?.index,
            currentStart = current.startPosition?.index;

        if (previousEnd == null || currentStart == null || currentStart != previousEnd) {
            return false;
        }

        return current.name.startsWith('[');
    }

    static prettyPrintNode(antlersNode: AntlersNode, doc: AntlersDocument, indent: number, options: TransformOptions, prepend: string | null, seedIndent: number | null): string {

        const lexerNodes = antlersNode.getTrueRuntimeNodes();

        // Tracks, per open array literal, whether that array is being
        // printed across multiple lines. The innermost array is last.
        const arrayWrapStack: ArrayPrintLayout[] = [],
            arrayWrapDecisions = options.arrayWrap == 'collapse'
                ? new Map<string, ArrayWrapLayout>()
                : NodePrinter.resolveArrayWrapping(lexerNodes, options);
        let nodeStatements = 0,
            nodeOperators = 0,
            arrayLiteralDepth = 0;

        if (lexerNodes.length > 0) {
            const nodeBuffer = new NodeBuffer(antlersNode, indent, prepend);

            if (seedIndent != null) {
                nodeBuffer.setIndentSeed(seedIndent);
            }

            let lastPrintedNode: AbstractNode | null = null;


            for (let i = 0; i < lexerNodes.length; i++) {
                const node = lexerNodes[i];

                if (lastPrintedNode != null) {
                    if (node.endPosition?.isBefore(lastPrintedNode.startPosition)) {
                        continue;
                    }
                }

                let insertNlAfter = false;

                if (node instanceof LogicGroupEnd) {
                    if (node.next instanceof LogicGroupEnd == false && node.next != null) {
                        if (!LanguageParser.isOperatorType(node.next) || !LanguageParser.isAssignmentOperator(node.next)) {
                            if (node.next instanceof StatementSeparatorNode == false && node.next instanceof InlineBranchSeparator == false) {
                                if (!node.isSwitchGroupMember && !LanguageParser.isOperatorType(node.next)) {
                                    insertNlAfter = true;

                                    if (node.next instanceof VariableNode && node.next.name == 'as') {
                                        insertNlAfter = false;
                                    }
                                }
                            }

                            if (node.next instanceof ModifierSeparator) {
                                insertNlAfter = false;
                            }
                        }
                    }
                } else {
                    if (!node.prev?.isVirtual && node.prev?.isVirtualGroupOperatorResolve && node.prev.producesVirtualStatementTerminator) {
                         const followsVariableStatement = node.prev instanceof VariableNode &&
                             node instanceof VariableNode && arrayLiteralDepth == 0 &&
                             !node.convertedToOperator && node.name != 'as' &&
                             !doc.getDocumentParser().getLanguageParser().isMergedVariableComponent(node) &&
                             !NodePrinter.isAdjacentArrayAccessor(node.prev, node);

                        if ((!(node.prev instanceof VariableNode) || followsVariableStatement) &&
                            !(node.next instanceof InlineTernarySeparator) && !(node instanceof InlineTernarySeparator)) {
                            nodeBuffer.newlineNDIndent();
                        }
                    }
                }

                if (node instanceof VariableNode) {
                    const rawArrayParts = NodePrinter.splitArrayBrackets(node.name),
                        arrayDepthBefore = arrayLiteralDepth;

                    if (rawArrayParts != null) {
                        arrayLiteralDepth += rawArrayParts.openCount;
                        arrayLiteralDepth = Math.max(0, arrayLiteralDepth - rawArrayParts.closeCount);
                    }

                    const nextNode = i + 1 < lexerNodes.length ? lexerNodes[i + 1] : null,
                        closesStatementArray = rawArrayParts != null && rawArrayParts.closeCount > 0 &&
                            (arrayDepthBefore + rawArrayParts.openCount) > 0 && arrayLiteralDepth == 0 &&
                            nextNode instanceof VariableNode && !nextNode.convertedToOperator && !nextNode.isVirtual &&
                            NodePrinter.hasLineBreakAfter(node, nextNode, doc);

                    const isInterpolationRegion = antlersNode.interpolationRegions?.has(node.name) ?? false,
                        arrayParts = options.arrayWrap == 'collapse' || isInterpolationRegion
                            ? null
                            : rawArrayParts;

                    if (arrayParts != null) {
                        for (let b = 0; b < arrayParts.openCount; b++) {
                            const layout = arrayWrapDecisions.get(NodePrinter.bracketKey(i, b)) ?? {
                                wrap: false,
                                itemIndent: '',
                                closeIndent: ''
                            },
                                outputRootIndent = arrayWrapStack.length > 0
                                    ? arrayWrapStack[0].outputRootIndent
                                    : nodeBuffer.getCurrentLineIndent(),
                                printLayout: ArrayPrintLayout = {
                                    wrap: layout.wrap,
                                    itemIndent: outputRootIndent + layout.itemIndent,
                                    closeIndent: outputRootIndent + layout.closeIndent,
                                    outputRootIndent: outputRootIndent
                                };

                            arrayWrapStack.push(printLayout);
                            nodeBuffer.append('[');

                            if (printLayout.wrap) {
                                nodeBuffer.newLine().append(printLayout.itemIndent);
                            }
                        }

                        if (arrayParts.value.length > 0) {
                            nodeBuffer.appendOS(arrayParts.value);
                        }

                        for (let b = 0; b < arrayParts.closeCount; b++) {
                            const layout = arrayWrapStack.pop();

                            if (layout?.wrap) {
                                nodeBuffer.newLine().append(layout.closeIndent);
                            }

                            nodeBuffer.append(']');
                        }

                        if (closesStatementArray) {
                            nodeBuffer.newlineIndent();
                        }

                        lastPrintedNode = node;
                        continue;
                    }

                    if (antlersNode.interpolationRegions && antlersNode.interpolationRegions.has(node.name)) {
                        const interpolatedRegion = antlersNode.interpolationRegions.get(node.name);

                        if (interpolatedRegion) {
                            nodeBuffer.append(interpolatedRegion.content);
                            continue;
                        }
                    } else if (node.convertedToOperator) {
                        if (node.name == 'arr') {
                            nodeBuffer.appendT(' arr');
                        } else if (node.name == 'switch' || node.name == 'list') {
                            nodeBuffer.appendTS(' ' + node.name, true);

                            if (i + 1 < lexerNodes.length) {
                                const next = lexerNodes[i + 1];

                                if (!(next instanceof LogicGroupBegin)) {
                                    break;
                                }

                                // Keep <switch/list>( together, and start a new line for the conditions.

                                nodeBuffer.append('(');
                                if (node.name != 'list') {
                                    nodeBuffer
                                        .relativeIndent(node.name)
                                        .newLine().indent();
                                }
                                i += 1;
                                lastPrintedNode = lexerNodes[i + 1];
                                continue;
                            } else {
                                break;
                            }
                        } else {
                            nodeOperators += 1;

                            if (nodeOperators > 1) {
                                nodeBuffer.newlineNDIndent().indent().addIndent(6).appendS(node.name);
                            } else {
                                if (doc.getDocumentParser().getLanguageParser().isMergedVariableComponent(node)) {
                                    nodeBuffer.append(node.name);
                                    continue;
                                }
                                nodeBuffer.appendS(node.name);
                            }
                        }
                        lastPrintedNode = node;
                        continue;
                    }
                    if (node.mergeRefName != null && node.mergeRefName.trim().length > 0 && node.mergeRefName != node.name) {
                        nodeBuffer.append(node.mergeRefName.trim());
                    } else {
                        if (node.name == 'as') {
                            nodeBuffer.appendOS('as');
                        } else {
                            if (node.methodTarget != null) {
                                if (node.variableReference != null) {
                                    node.variableReference.pathParts.forEach((part) => {
                                        if (part instanceof PathNode) {
                                            nodeBuffer.append(part.name);
                                            nodeBuffer.append('.');
                                        }
                                    });
                                }

                                nodeBuffer.append(node.methodTarget.method?.name ?? '');

                                continue;
                            }
                            nodeBuffer.append(node.name.trim());
                        }
                    }

                    if (closesStatementArray) {
                        insertNlAfter = true;
                    }
                } else if (node instanceof TupleListStart) {
                    nodeBuffer.appendTS(' list');

                    if (i + 1 < lexerNodes.length) {
                        const next = lexerNodes[i + 1];

                        if (!(next instanceof LogicGroupBegin)) {
                            break;
                        }

                        // Keep <switch/list>( together, and start a new line for the conditions.

                        nodeBuffer.append('(');
                        i += 1;
                        lastPrintedNode = lexerNodes[i + 1];
                        continue;
                    } else {
                        break;
                    }
                } else if (node instanceof ModifierSeparator) {
                    nodeBuffer.appendS('|');
                } else if (node instanceof InlineBranchSeparator) {
                    if (lastPrintedNode != null) {
                        if (node.startPosition?.isBefore(lastPrintedNode.endPosition)) {
                            continue;
                        }
                    }

                    if (node.next instanceof VariableNode) {
                        if (node.next.mergeRefName.startsWith(':')) {
                            continue;
                        }
                    }

                    if (doc.getDocumentParser().getLanguageParser().isMergedVariableComponent(node)) {
                        if (!nodeBuffer.endsWith(':')) {
                            nodeBuffer.append(':');
                        }
                        continue;
                    }

                    if (node.prev != null && node.next != null) {
                        if (NodeHelpers.distance(node.prev, node) <= 1 && NodeHelpers.distance(node.next, node) <= 1) {
                            nodeBuffer.append(':');
                            lastPrintedNode = node;
                            continue;
                        }
                    }

                    if (doc.getDocumentParser().getLanguageParser().isActualModifierSeparator(node)) {
                        nodeBuffer.append(':');
                        lastPrintedNode = node;
                        continue;
                    }

                    if (lastPrintedNode instanceof ModifierNameNode || lastPrintedNode instanceof ModifierValueNode) {
                        nodeBuffer.append(':');
                        lastPrintedNode = node;
                        continue;
                    }

                    nodeBuffer.appendS(':');
                } else if (node instanceof ModifierNameNode) {
                    nodeBuffer.append(node.name);
                } else if (node instanceof InlineTernarySeparator) {
                    nodeBuffer.appendS('?');
                } else if (node instanceof ModifierValueSeparator) {
                    if (doc.getDocumentParser().getLanguageParser().isMergedVariableComponent(node)) {
                        continue;
                    }

                    if (node.isTenaryBranchSeparator) {
                        nodeBuffer.appendS(':');
                        lastPrintedNode = node;
                        continue;
                    }

                    if (doc.getDocumentParser().getLanguageParser().isActualModifierSeparator(node)) {
                        nodeBuffer.append(':');
                        lastPrintedNode = node;
                        continue;
                    }

                    nodeBuffer.append(':');
                } else if (node instanceof ModifierValueNode) {
                    const sourceContent = NodePrinter.sourceContent(node, doc),
                        isQuoted = (sourceContent.startsWith("'") && sourceContent.endsWith("'")) ||
                            (sourceContent.startsWith('"') && sourceContent.endsWith('"'));

                    nodeBuffer.append(isQuoted ? sourceContent : node.value.trim());
                } else if (node instanceof LogicGroupBegin) {
                    nodeBuffer.append('(');
                } else if (node instanceof LogicGroupEnd) {
                    nodeBuffer.append(')');
                } else if (node instanceof StringValueNode) {
                    if (doc.getDocumentParser().getLanguageParser().isMergedVariableComponent(node)) {
                        continue;
                    }

                    if (node.sourceContent != '') {
                        nodeBuffer.appendOS(node.sourceContent);
                    } else {
                        nodeBuffer.appendOS(node.sourceTerminator + node.value + node.sourceTerminator);
                    }
                } else if (node instanceof ArgSeparator) {
                    if (node.isSwitchGroupMember) {
                        nodeBuffer.append(',')
                            .newlineIndent();
                    } else {
                        const nextNode = i + 1 < lexerNodes.length ? lexerNodes[i + 1] : null,
                            nextParts = nextNode instanceof VariableNode
                                ? NodePrinter.splitArrayBrackets(nextNode.name)
                                : null,
                            isTrailingSeparator = arrayLiteralDepth > 0 && nextParts != null &&
                                nextParts.value.length == 0 && nextParts.openCount == 0 && nextParts.closeCount > 0;

                        if (isTrailingSeparator) {
                            nodeBuffer.append(',');
                            lastPrintedNode = node;
                            continue;
                        }

                        if (arrayWrapStack.length > 0 && arrayWrapStack[arrayWrapStack.length - 1].wrap) {
                            const layout = arrayWrapStack[arrayWrapStack.length - 1];

                            nodeBuffer.append(',')
                                .newLine()
                                .append(layout.itemIndent);
                        } else {
                            nodeBuffer.append(', ');
                        }
                    }
                } else if (node instanceof NumberNode) {
                    lastPrintedNode = node;
                    if (doc.getDocumentParser().getLanguageParser().isMergedVariableComponent(node)) {
                        continue;
                    }

                    let valueToPrint = node.value?.toString() ?? '';

                    if (node.rawLexContent != null && node.rawLexContent.trim().length > 0) {
                        valueToPrint = node.rawLexContent.trim();
                    }

                    nodeBuffer.append(valueToPrint);
                } else if (node instanceof LeftAssignmentOperator) {
                    nodeBuffer.appendS('=');
                } else if (node instanceof ScopeAssignmentOperator) {
                    nodeBuffer.appendS('=>');
                } else if (node instanceof AdditionOperator) {
                    nodeBuffer.appendS('+');
                } else if (node instanceof SubtractionOperator) {
                    if (doc.getDocumentParser().getLanguageParser().isMergedVariableComponent(node)) {
                        lastPrintedNode = node;
                        nodeBuffer.append('-');
                        continue;
                    }

                    if (node.prev != null && node.next != null) {
                        if (NodeHelpers.distance(node.prev, node) <= 1 && NodeHelpers.distance(node.next, node) <= 1) {
                            if (node.next instanceof NumberNode && node.prev instanceof NumberNode) {
                                nodeBuffer.appendS('-');
                            } else {
                                nodeBuffer.append('-');
                            }

                            lastPrintedNode = node;
                            continue;
                        }
                    }

                    nodeBuffer.appendS('-');
                } else if (node instanceof MultiplicationOperator) {
                    nodeBuffer.appendS('*');
                } else if (node instanceof DivisionOperator) {
                    lastPrintedNode = node;

                    if (node.startPosition?.isBefore(antlersNode.nameEndsOn)) {
                        nodeBuffer.append('/');
                        continue;
                    }

                    if (doc.getDocumentParser().getLanguageParser().isMergedVariableComponent(node)) {
                        continue;
                    }

                    nodeBuffer.appendS('/');
                    continue;
                } else if (node instanceof StatementSeparatorNode) {
                    if (node.isListGroupMember) {
                        nodeBuffer.append(';')
                            .newlineIndent().indent().addIndent(7);

                        if (i + 1 < lexerNodes.length && (lexerNodes[i + 1] instanceof LogicGroupEnd) == false) {
                            nodeBuffer.indent();
                        }
                    } else {
                        nodeStatements += 1;

                        if (nodeStatements < options.maxAntlersStatementsPerLine) {
                            nodeBuffer.appendT('; ');
                        } else {
                            nodeBuffer.appendT(';').newlineIndent();
                            nodeStatements = 0;
                        }
                    }
                } else if (node instanceof LogicalNegationOperator) {
                    if (node.content == 'not') {
                        nodeBuffer.appendS('not');
                    } else {
                        nodeBuffer.append('!');
                    }
                } else if (node instanceof ModulusOperator) {
                    if (i == 0 && antlersNode.pathReference?.isStrictTagReference) {
                        // Ignore for now.
                    } else {
                        nodeBuffer.appendS(node.rawContent());
                    }
                } else if (node instanceof MethodInvocationNode) {
                    nodeBuffer.append('->');
                } else if (node instanceof LogicalAndOperator) {
                    if (lastPrintedNode != null && lastPrintedNode instanceof SubtractionOperator) {
                        const distance = NodeHelpers.distance(lastPrintedNode, node);

                        if (distance < 0) {
                            nodeBuffer.append(node.rawContent());
                        } else {
                            nodeBuffer.appendS(node.rawContent());
                        }
                    } else {
                        nodeBuffer.appendS(node.rawContent());
                    }
                } else if (node instanceof LogicalOrOperator) {
                    if (lastPrintedNode != null && lastPrintedNode instanceof SubtractionOperator) {
                        const distance = NodeHelpers.distance(lastPrintedNode, node);

                        if (distance < 0) {
                            nodeBuffer.append(node.content);
                        } else {
                            nodeBuffer.appendS(node.content);
                        }
                    } else {
                        nodeBuffer.appendS(node.content);
                    }
                }  else {
                    nodeBuffer.appendS(node.rawContent());
                }

                if (insertNlAfter) {
                    nodeBuffer.newlineIndent();
                }

                lastPrintedNode = node;
            }

            if (antlersNode.hasParameters) {
                antlersNode.parameters.forEach((param) => {
                    nodeBuffer.paramS(param);
                });
            }

            nodeBuffer.close();


            let bContent = nodeBuffer.getContent();

            if (antlersNode.processedInterpolationRegions.size > 0) {
                const regions = new Map([...antlersNode.processedInterpolationRegions.entries()].sort().reverse());
                regions.forEach((region, key) => {
                    const iTResult = NodePrinter.prettyPrintNode(region[0] as AntlersNode, doc, indent, options, null, null);
                    bContent = replaceAllInString(bContent, key, iTResult);
                });
            }

            return bContent;
        }

        return antlersNode.getTrueRawContent();
    }
}

interface ArrayBracketParts {
    openCount: number,
    value: string,
    closeCount: number
}

interface ArrayBracket {
    key: string,
    line: number,
    hasItems: boolean,
    depth: number
}

interface ArrayWrapLayout {
    wrap: boolean,
    itemIndent: string,
    closeIndent: string
}

interface ArrayPrintLayout extends ArrayWrapLayout {
    outputRootIndent: string
}
