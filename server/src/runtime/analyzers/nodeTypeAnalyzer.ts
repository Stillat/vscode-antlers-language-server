import { AbstractNode, AntlersNode } from '../nodes/abstractNode';
import EnvironmentDetails from "../runtime/environmentDetails";

class NodeTypeAnalyzer {
    static environmentDetails: EnvironmentDetails | null = null;

    static analyze(
        nodes: AbstractNode[],
        environmentDetails: EnvironmentDetails
    ) {
        nodes.forEach((node) => {
            if (node instanceof AntlersNode) {
                if (
                    node.pathReference != null &&
                    node.pathReference.isStrictVariableReference
                ) {
                    node.isTagNode = false;
                    return;
                }

                if (node.name != null) {
                    node.isTagNode = environmentDetails.isTag(node.name.name);
                }
            }
        });
    }

    static analyzeNode(node: AntlersNode) {
        if (
            node.pathReference != null &&
            node.pathReference.isStrictVariableReference
        ) {
            node.isTagNode = false;

            return;
        }

        if (NodeTypeAnalyzer.environmentDetails != null && node.name != null) {
            node.isTagNode = NodeTypeAnalyzer.environmentDetails.isTag(
                node.name.name
            );
        }

        if (node.name != null) {
            node.isConditionNode = EnvironmentDetails.alwaysLikeTag.includes(
                node.name.name
            );
        }
    }

    static analyzeParametersForModifiers(node: AntlersNode) {
        node.parameters.forEach((parameter) => {
            if (NodeTypeAnalyzer.environmentDetails != null) {
                parameter.isModifierParameter =
                    NodeTypeAnalyzer.environmentDetails.isModifier(parameter.name);
            }
        });
    }
}

if (
    typeof NodeTypeAnalyzer.environmentDetails == "undefined" ||
    NodeTypeAnalyzer.environmentDetails == null
) {
    NodeTypeAnalyzer.environmentDetails = new EnvironmentDetails();
}

export default NodeTypeAnalyzer;
