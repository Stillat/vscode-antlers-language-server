import { AntlersNode, ConditionNode, FragmentPosition, LiteralNode } from '../nodes/abstractNode.js';
import { DocumentParser } from '../parser/documentParser.js';
import { FragmentsParser } from '../parser/fragmentsParser.js';
import { ConditionPairAnalyzer } from './conditionPairAnalyzer.js';

export class FragmentPositionAnalyzer {
    private documentParser: DocumentParser;
    private fragmentsParser: FragmentsParser;

    constructor(document: DocumentParser, fragments: FragmentsParser) {
        this.documentParser = document;
        this.fragmentsParser = fragments;
    }

    private doesContainFragments(node: AntlersNode): boolean {
        const startIndex = node.endPosition?.index ?? 0,
            endIndex = node.isClosedBy?.startPosition?.index ?? 0;


        return this.fragmentsParser.getFragmentsBetween(startIndex, endIndex).length > 0;
    }

    analyze() {
        const allNodes = this.documentParser.getNodes();

        if (!this.fragmentsParser.hasFragments()) {
            return;
        }

        this.fragmentsParser.getFragments().forEach((fragment) => {
            const lowerName = fragment.name.toLowerCase();

            if (fragment.isClosingFragment == false && fragment.isSelfClosing == false && (lowerName == 'script' || lowerName == 'style')) {
                const closingFragment = this.fragmentsParser.getClosingFragmentAfter(fragment);

                if (closingFragment == null) { return; }

                if (fragment.endPosition != null && closingFragment.startPosition != null) {
                    const containedNodes = this.documentParser.getNodesBetween(fragment.endPosition, closingFragment.startPosition);

                    containedNodes.forEach((node) => {
                        if (node instanceof ConditionNode) {
                            fragment.containsStructures = true;
                        } else if (node instanceof AntlersNode) {
                            if (node.isClosedBy != null) {
                                fragment.containsStructures = true;
                            }
                        }

                        if (lowerName == 'style') {
                            node.isInStyleTag = true;
                        } else {
                            node.isInScriptTag = true;
                        }
                    });
                }
            }
        });

        allNodes.forEach((node) => {
            if (node instanceof LiteralNode) { return; }
            if (node.startPosition == null) { return; }

            if (node instanceof AntlersNode && (ConditionPairAnalyzer.isConditionalStructure(node) || !node.isClosingTag) && node.isClosedBy != null) {
                node.containsAnyFragments = this.doesContainFragments(node);
            }

            const fragment = this.fragmentsParser.getFragmentContaining(node.startPosition);

            if (fragment == null) { 
                node.fragmentPosition = FragmentPosition.Unresolved;
                return;
            }

            node.fragment = fragment;
            const startDelta = node.startPosition.index - (fragment.startPosition?.index ?? 0);

            if (startDelta <= 3) {
                node.fragmentPosition = FragmentPosition.IsDynamicFragmentName;
                return;
            }

            if (fragment.parameters.length == 0) {
                node.fragmentPosition = FragmentPosition.InsideFragment;
                return;
            }

            let resolvedParam = false;
            for (let i = 0; i < fragment.parameters.length; i++) {
                const thisParam = fragment.parameters[i];

                if ((thisParam.startPosition?.index ?? 0) < node.startPosition.index && (thisParam.endPosition?.index ?? 0) > node.startPosition.index) {
                    node.fragmentPosition = FragmentPosition.InsideFragmentParameter;
                    node.fragmentParameter = thisParam;
                    resolvedParam = true;
                    break;
                }
            }

            if (!resolvedParam) {
                node.fragmentPosition = FragmentPosition.InsideFragment;
            }
        });
    }
}