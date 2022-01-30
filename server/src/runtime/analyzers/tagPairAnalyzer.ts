import { AntlersError } from '../errors/antlersError';
import { AntlersErrorCodes } from '../errors/antlersErrorCodes';
import { AbstractNode, AntlersNode, AntlersParserFailNode, ConditionNode, EscapedContentNode, ExecutionBranch, RecursiveNode } from '../nodes/abstractNode';
import { TagIdentifier } from '../nodes/tagIdentifier';
import { DocumentParser } from '../parser/documentParser';
import { NoParseManager } from '../runtime/noParseManager';
import { intersect } from '../utilities/arrayHelpers';
import { ConditionPairAnalyzer } from './conditionPairAnalyzer';

export class TagPairAnalyzer {
    static readonly ForceBreakLimit = 100000;

    private closingTagIndex: Map<number, Map<string, AntlersNode[]>> = new Map();
    private closingTagIndexCount: Map<number, Map<string, number>> = new Map();
    private openTagIndexCount: Map<number, Map<string, number>> = new Map();
    private closingTagNames: Map<number, string[]> = new Map();
    private parentNode: AntlersNode | null = null;
    private stackCount = 0;
    private createdExecutionBranches: ExecutionBranch[] = [];
    private document: DocumentParser | null = null;

    private getClosingCandidates(node: AbstractNode) {
        if ((node instanceof AntlersNode || node instanceof AntlersParserFailNode) && node.isClosingTag == false) {
            const compound = node.name?.compound ?? '';

            if (compound == 'if') {
                return ['if', 'elseif', 'else'];
            } else if (compound == 'elseif') {
                return ['elseif', 'else', 'if'];
            } else if (compound == 'else') {
                return ['if'];
            }

            return [compound];
        }

        return [];
    }

    private buildCloseIndex(nodes: AbstractNode[]) {
        nodes.forEach((node) => {
            if (node instanceof RecursiveNode) {
                return;
            }

            if ((node instanceof AntlersNode || node instanceof AntlersParserFailNode) && node.isSelfClosing) {
                return;
            }

            if ((node instanceof AntlersNode || node instanceof AntlersParserFailNode) && node.isClosingTag) {
                if (this.closingTagIndex.has(this.stackCount) == false) {
                    this.closingTagIndex.set(this.stackCount, new Map());
                }

                if (this.closingTagIndexCount.has(this.stackCount) == false) {
                    this.closingTagIndexCount.set(this.stackCount, new Map());
                }

                const compound = node.name?.compound ?? '';

                if (this.closingTagIndex.get(this.stackCount)?.has(compound) == false) {
                    this.closingTagIndex.get(this.stackCount)?.set(compound, []);
                    this.closingTagIndexCount.get(this.stackCount)?.set(compound, 0);
                }

                this.closingTagIndex.get(this.stackCount)?.get(compound)?.push(node);
                const curCount = this.closingTagIndexCount.get(this.stackCount)?.get(compound) ?? 0;
                this.closingTagIndexCount.get(this.stackCount)?.set(compound, curCount + 1);
            }
        });

        if (this.closingTagNames.has(this.stackCount) == false) {
            this.closingTagNames.set(this.stackCount, []);
        }

        // Process the closing tag index, if it has been set for the current stack level.
        if (this.closingTagIndex.has(this.stackCount)) {
            this.closingTagNames.set(this.stackCount, Array.from(this.closingTagIndex.get(this.stackCount)?.keys() ?? []));

            this.closingTagIndex.get(this.stackCount)?.forEach((indexedNodes, tagName) => {
                const indexedNodeCount = indexedNodes.length;

                if (indexedNodeCount == 0) {
                    return;
                }

                // Find the last closing tag candidate, and work up
                // to calculate a list of valid opening candidates.
                const lastIndexedNode = indexedNodes[indexedNodeCount - 1];

                for (let i = 0; i < indexedNodeCount; i++) {
                    const node = nodes[i];

                    if ((node instanceof AntlersNode || node instanceof AntlersParserFailNode)) {
                        if (node instanceof RecursiveNode) {
                            continue;
                        }

                        if (node.index >= lastIndexedNode.index) {
                            break;
                        }

                        const compound = node.name?.compound ?? '';

                        if (node.isClosingTag == false && tagName == compound) {
                            if (this.openTagIndexCount.has(this.stackCount) == false) {
                                this.openTagIndexCount.set(this.stackCount, new Map());
                            }

                            if (this.openTagIndexCount.get(this.stackCount)?.has(tagName) == false) {
                                this.openTagIndexCount.get(this.stackCount)?.set(tagName, 0);
                            }

                            const curCount = this.openTagIndexCount.get(this.stackCount)?.get(tagName) ?? 0;
                            this.openTagIndexCount.get(this.stackCount)?.set(tagName, curCount + 1);
                        }
                    }
                }
            });
        }
    }

    private getScanForList(node: AbstractNode) {
        if ((node instanceof AntlersNode || node instanceof AntlersParserFailNode)) {
            const compound = node.name?.compound;

            if (compound == 'else') {
                return ['if'];
            }

            if (compound == 'elseif') {
                return ['elseif', 'else', 'if'];
            }

            if (node.isClosingTag == false) {
                const candidates = this.getClosingCandidates(node),
                    indexValues = this.closingTagNames.get(this.stackCount) as string[];

                return intersect(candidates, indexValues) as string[];
            }

        }

        return [];
    }

    private canPossiblyClose(node: AntlersNode) {
        if (node instanceof RecursiveNode) {
            return false;
        }

        if (node instanceof AntlersParserFailNode || node instanceof AntlersNode) {
            if (node.isComment) {
                return false;
            }

            if (node.isSelfClosing) {
                return false;
            }

            const compound = node.name?.compound ?? '';

            if (compound == 'else' || compound == 'elseif') {
                return true;
            }

            if (node.isClosingTag == false) {
                const candidates = this.getClosingCandidates(node),
                    indexValues = this.closingTagNames.get(this.stackCount) as string[],
                    overlap = intersect(candidates, indexValues);

                return overlap.length > 0;
            }
        }

        return false;
    }

    private findClosingPair(nodes: AbstractNode[], node: AntlersNode, scanFor: string[]) {
        const refRuntimeNodeCount = node.runtimeNodes.length,
            nodeLength = nodes.length;
        let refStack = 0;

        for (let i = 0; i < nodeLength; i++) {
            const candidateNode = nodes[i];

            if (candidateNode instanceof AntlersNode || candidateNode instanceof AntlersParserFailNode) {
                if (node.endPosition != null && candidateNode.startPosition != null) {
                    if (node.endPosition.isBefore(candidateNode.startPosition)) {
                        if (candidateNode.isClosingTag && candidateNode.isOpenedBy != null) {
                            continue;
                        }

                        if (candidateNode.isSelfClosing) {
                            continue;
                        }

                        const compound = candidateNode.name?.compound ?? '';

                        if (candidateNode.isClosingTag == false) {

                            if (scanFor.includes(compound)) {
                                const refOpen = this.openTagIndexCount.get(this.stackCount)?.get(compound) as number,
                                    refClose = this.closingTagIndexCount.get(this.stackCount)?.get(compound) as number;

                                if (refOpen != refClose) {
                                    if (candidateNode.runtimeNodes.length >= refRuntimeNodeCount) {
                                        // continue;
                                    }
                                }

                                refStack += 1;
                            }
                            continue;
                        }

                        if (scanFor.includes(compound)) {
                            if (refStack > 0) {
                                refStack -= 1;
                                continue;
                            }
                        }

                        if (refStack == 0 && scanFor.includes(compound)) {
                            candidateNode.isOpenedBy = node;
                            node.isClosedBy = candidateNode;
                            break;
                        }
                    }
                } else {
                    continue;
                }
            }
        }
    }

    associate(documentNodes: AbstractNode[], document: DocumentParser) {
        this.document = document;

        // Maintain our own stack to avoid recursive calls.
        //
        // The document will remain the same across all.
        const nodeStack: NodeStackItem[] = [{
            documentNodes: documentNodes,
            parent: null
        }];
        let nodesToReturn: AbstractNode[] = [];


        while (nodeStack.length > 0) {
            const details = nodeStack.pop();

            if (details == null) { continue; }

            let nodes = details.documentNodes;
            this.parentNode = details.parent;

            this.stackCount += 1;
            this.buildCloseIndex(nodes);

            // Ask the specialized control structure to do its job first.
            nodes = ConditionPairAnalyzer.pairConditionals(nodes);

            nodes.forEach((node) => {
                if ((node instanceof AntlersNode || node instanceof AntlersParserFailNode) && this.canPossiblyClose(node)) {
                    if (ConditionPairAnalyzer.isConditionalStructure(node)) {
                        return;
                    }

                    const scanFor = this.getScanForList(node);
                    this.findClosingPair(nodes, node, scanFor);
                }
            });

            // Step 1: Set the node parent relationships.
            const nodeCount = nodes.length;
            for (let i = 0; i < nodeCount; i++) {
                const node = nodes[i];

                if ((node instanceof AntlersNode || node instanceof AntlersParserFailNode) && node.isClosedBy != null) {
                    for (let j = i + 1; j < nodeCount; j++) {
                        const childNode = nodes[j];

                        if (childNode.index > node.isClosedBy.index) {
                            break;
                        }

                        childNode.parent = node;

                        node.children.push(childNode);

                        if (childNode instanceof AntlersNode && childNode.index == node.index) {
                            childNode.parent = node;
                            break;
                        }
                    }
                }
            }

            // Step 2: Build up the inner children nodes.
            nodes.forEach((node) => {
                if ((node instanceof AntlersNode || node instanceof AntlersParserFailNode) && node.children.length > 0) {
                    const newChildren: AbstractNode[] = [];

                    node.children.forEach((childNode) => {
                        if (childNode.parent != null) {
                            if (childNode.parent.index == node.index) {
                                childNode.parent = node;
                                newChildren.push(childNode);
                            }
                        }
                    });

                    nodeStack.push({
                        documentNodes: newChildren,
                        parent: node
                    });
                }
            });

            // Step 3: Extract the "root" nodes. These will be our new "nested" nodes.
            let nestedNodes: AbstractNode[] = [];

            nodes.forEach((node) => {
                if (this.parentNode == null) {
                    if (node.parent == null) {
                        nestedNodes.push(node);
                    }
                } else {
                    if (node.parent == this.parentNode) {
                        nestedNodes.push(node);
                    }
                }
            });

            nestedNodes = this.reduceConditionals(nestedNodes);
            const nestedNodeKeyMap: Map<string, number> = new Map();

            nodes.forEach((node) => {
                if ((node instanceof AntlersNode || node instanceof AntlersParserFailNode) && node.isClosedBy != null) {
                    if (this.document != null) {
                        const content = this.document.getText(
                            (node.endPosition?.index ?? 0) + 1,
                            (node.isClosedBy.startPosition?.index ?? 0)
                        );

                        node.runtimeContent = content;
                    }
                }
            });

            for (let i = 0; i < nestedNodes.length; i++) {
                const node = nestedNodes[i],
                    refId = node.refId ?? '';
                nestedNodeKeyMap.set(refId, 1);

                if ((node instanceof AntlersNode || node instanceof AntlersParserFailNode) &&
                    node.isComment == false &&
                    node.name?.name == 'noparse' &&
                    (node instanceof EscapedContentNode) == false &&
                    node.isClosingTag == false) {
                    if (node.isClosedBy == null) {
                        node.pushError(AntlersError.makeSyntaxError(
                            AntlersErrorCodes.TYPE_NO_PARSE_UNASSOCIATED,
                            node,
                            'Encountered noparse region without a closing tag. All noparse regions must be closed.'
                        ));
                        continue;
                    }

                    let content = node.content;

                    if (this.document != null) {
                        content = this.document.getText(
                            (node.endPosition?.index ?? 0) + 1,
                            (node.isClosedBy?.startPosition?.index ?? 0)
                        );
                    }

                    const noParseNode = new EscapedContentNode(),
                        nodeParser = node.getParser();

                    if (nodeParser != null) {
                        noParseNode.withParser(nodeParser);
                    }

                    node.copyBasicDetailsTo(noParseNode);
                    noParseNode.name = new TagIdentifier();
                    noParseNode.name.name = 'noparse';
                    noParseNode.name.compound = 'noparse';

                    noParseNode.content = NoParseManager.registerNoParseContent(content);
                    noParseNode.originalNode = node;

                    nestedNodes[i] = noParseNode;
                }
            }

            if (this.parentNode != null && (this.parentNode instanceof AntlersParserFailNode || this.parentNode instanceof AntlersNode)) {
                this.parentNode.children = nestedNodes;

                if (this.parentNode.parent != null && this.parentNode.parent instanceof AntlersNode) {
                    const ancestorNodes = this.parentNode.parent.children,
                        newAncestorNodes: AbstractNode[] = [];

                    ancestorNodes.forEach((aNode) => {
                        // Because we are processing the deeply nested
                        // nodes *after* their parent nodes, we have
                        // to make sure to clean up the node tree.

                        if (nestedNodeKeyMap.has(aNode.refId ?? '') == false) {
                            newAncestorNodes.push(aNode);
                        }
                    });

                    this.parentNode.parent.children = newAncestorNodes;
                }
            }

            if (this.stackCount <= 1) {
                nodesToReturn = nestedNodes;
            }
        }

        if (this.createdExecutionBranches.length > 0) {
            this.createdExecutionBranches.forEach((branch) => {
                if (branch.head != null) {
                    // The execution branch's head node's children
                    // may have changed due to how children
                    // are processed non-recursively.
                    branch.nodes = branch.head.children;
                }
            });
        }

        return nodesToReturn;
    }

    private findEndOfBranch(nodes: AbstractNode[], start: AntlersNode, startedAt: number) {
        const children: AbstractNode[] = [],
            offset = startedAt;
        let tail: AntlersNode | null = null;

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];

            if ((node instanceof AntlersNode || node instanceof AntlersParserFailNode) && node.isOpenedBy != null && node.isOpenedBy == start) {
                tail = node;
                break;
            } else {
                children.push(node);
            }
        }

        return {
            children: children,
            tail: tail,
            offset: offset
        };
    }

    private reduceConditionals(nodes: AbstractNode[]) {
        const reduced: AbstractNode[] = [];

        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];

            if ((node instanceof AntlersNode || node instanceof AntlersParserFailNode) && node.isComment == false && node.isClosingTag == false && node.isClosedBy != null) {
                const compound = node.name?.compound ?? '';

                if (compound == 'if') {
                    const conditionNode = new ConditionNode();
                    conditionNode.index = node.index;
                    conditionNode.chain.push(node.index);

                    if (this.parentNode != null) {
                        conditionNode.parent = this.parentNode;
                    }

                    let exitedOn: number | null = null,
                        doContinue = true,
                        currentDepth = 0;

                    while (doContinue) {
                        currentDepth += 1;

                        // The PHP version of the parser will throw a syntax exception
                        // before this ever has the chance to enter an infinite loop.
                        // We will cap the number of iterations it can do here.						
                        if (currentDepth > TagPairAnalyzer.ForceBreakLimit) {
                            doContinue = false;
                            break;
                        }

                        if ((node instanceof AntlersNode || node instanceof AntlersParserFailNode)) {
                            const result = this.findEndOfBranch(nodes.slice(i + 1), node, i),
                                executionBranch = new ExecutionBranch();

                            let tail = result.tail;

                            executionBranch.head = node;
                            executionBranch.tail = tail;
                            executionBranch.nodes = node.children;

                            if (tail == null) {
                                tail = executionBranch.head.isClosedBy;
                            }

                            if (tail != null && tail.startPosition != null) {
                                executionBranch.startPosition = tail.startPosition;
                            }

                            if (tail != null) {
                                executionBranch.index = tail.index;
                            }

                            if (executionBranch.nodes.length > 0) {
                                const lastNode = executionBranch.nodes[executionBranch.nodes.length - 1];

                                if (lastNode.endPosition != null) {
                                    executionBranch.endPosition = lastNode.endPosition;
                                }
                            } else {
                                if (tail != null && tail.endPosition != null) {
                                    executionBranch.endPosition = tail.endPosition;
                                }
                            }

                            // Maintain a record of all created execution branches.
                            this.createdExecutionBranches.push(executionBranch);

                            conditionNode.logicBranches.push(executionBranch);

                            if (tail?.isClosingTag && tail.name?.compound == 'if') {
                                exitedOn = result.offset;
                                doContinue = false;
                                break;
                            } else {
                                if (tail != null) {
                                    conditionNode.chain.push(tail.index);
                                }

                                i = result.offset;
                                if (tail instanceof AntlersNode) {
                                    node = tail;
                                }
                            }
                        } else {
                            doContinue = false;
                        }
                    }

                    if (conditionNode.logicBranches.length > 0) {
                        const firstBranch = conditionNode.logicBranches[0],
                            lastBranch = conditionNode.logicBranches[conditionNode.logicBranches.length - 1];

                        if (firstBranch.startPosition != null) {
                            conditionNode.startPosition = firstBranch.startPosition;
                        }

                        if (lastBranch.endPosition != null) {
                            conditionNode.endPosition = lastBranch.endPosition;
                        }
                    }

                    reduced.push(conditionNode);

                    if (exitedOn != null) {
                        if (exitedOn == nodes.length) {
                            break;
                        }
                    }
                } else {
                    reduced.push(node);
                }
            } else {
                reduced.push(node);
            }
        }

        return reduced;
    }
}

interface BranchSearchResults {
    tail: AntlersNode | null,
    children: AbstractNode[],
    offset: number
}

interface NodeStackItem {
    documentNodes: AbstractNode[],
    parent: AntlersNode | null
}