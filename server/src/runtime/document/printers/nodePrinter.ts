import { replaceAllInString } from '../../../utils/strings.js';
import { AbstractNode, AdditionOperator, AntlersNode, ArgSeparator, DivisionOperator, InlineBranchSeparator, InlineTernarySeparator, LeftAssignmentOperator, LogicalNegationOperator, LogicGroupBegin, LogicGroupEnd, MethodInvocationNode, ModifierNameNode, ModifierSeparator, ModifierValueNode, ModifierValueSeparator, ModulusOperator, MultiplicationOperator, NumberNode, PathNode, ScopeAssignmentOperator, StatementSeparatorNode, StringValueNode, SubtractionOperator, TupleListStart, VariableNode } from '../../nodes/abstractNode.js';
import { LanguageParser } from '../../parser/languageParser.js';
import { NodeHelpers } from '../../utilities/nodeHelpers.js';
import { AntlersDocument } from '../antlersDocument.js';
import { TransformOptions } from '../transformOptions.js';
import { NodeBuffer } from './nodeBuffer.js';

export class NodePrinter {
    
    static prettyPrintNode(antlersNode: AntlersNode, doc: AntlersDocument, indent: number, options:TransformOptions, prepend: string | null, seedIndent: number | null): string {

        const lexerNodes = antlersNode.getTrueRuntimeNodes();
        let nodeStatements = 0,
            nodeOperators = 0;

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
                        if (node.next != null) {
                            if (!(node.prev instanceof VariableNode) && !(node.next instanceof InlineTernarySeparator) && !(node instanceof InlineTernarySeparator)) {
                                nodeBuffer.newlineIndent();
                            }
                        }
                    }
                }

                if (node instanceof VariableNode) {
                    if (node.convertedToOperator) {
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
                    nodeBuffer.append(node.value.trim());
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
                        nodeBuffer.append(', ');
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
                } else {
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
                    const iTResult = NodePrinter.prettyPrintNode(region[0] as AntlersNode, doc, indent, options, null, null );
                    bContent = replaceAllInString(bContent, key, iTResult);
                });
            }

            return bContent;
        }

        return antlersNode.getTrueRawContent();
    }
}