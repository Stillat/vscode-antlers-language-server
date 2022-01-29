import { Location } from 'vscode-languageserver';
import { sessionDocuments } from '../languageService/documents';
import { AbstractNode, VariableNode } from '../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../suggestions/suggestionRequest';
import { nodeToRange } from '../utils/conversions';

export class VariableReferenceManager {
    static getReferences(params: ISuggestionRequest | null): Location[] | null {
        if (params == null) { return null; }

        if (params.context?.feature instanceof VariableNode) {
            const activeFeature = params.context.feature as VariableNode;

            if (activeFeature.scopeVariable == null || activeFeature.scopeVariable.sourceField == null) {
                return null;
            }

            const similarNodes: Map<string, AbstractNode[]> = new Map();

            sessionDocuments.getDocuments().forEach((doc) => {
                const antlersNodes = doc.getAllAntlersNodes(),
                    docSimilarNodes: AbstractNode[] = [];

                antlersNodes.forEach((node) => {
                    node.runtimeNodes.forEach((runtimeNode) => {
                        if (runtimeNode.scopeVariable != null && runtimeNode.scopeVariable == activeFeature.scopeVariable) {
                            docSimilarNodes.push(runtimeNode);
                        } else {
                            if (runtimeNode.scopeVariable != null && runtimeNode.scopeVariable.sourceName == activeFeature.scopeVariable?.sourceName) {
                                if (runtimeNode instanceof VariableNode) {
                                    if (runtimeNode.name == activeFeature.name) {
                                        docSimilarNodes.push(runtimeNode);
                                    }
                                }
                            }
                        }
                    });
                });

                similarNodes.set(doc.documentUri, docSimilarNodes);
            });

            const locations: Location[] = [];

            similarNodes.forEach((docNodes, docUri) => {
                docNodes.forEach((node) => {
                    locations.push({
                        uri: docUri,
                        range: nodeToRange(node)
                    });
                });
            });

            return locations;
        }

        return [];
    }
}