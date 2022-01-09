import { DocumentHighlight, DocumentHighlightParams } from 'vscode-languageserver';
import { makeProviderRequest } from '../providers/providerParameters';
import { AbstractNode, VariableNode } from '../runtime/nodes/abstractNode';
import { nodeToRange } from '../utils/conversions';

export function handleDocumentHighlight(_params: DocumentHighlightParams): DocumentHighlight[] | null {
	const docPath = decodeURIComponent(_params.textDocument.uri);

	const suggestionParams = makeProviderRequest(_params.position, docPath);

	if (suggestionParams == null) { return null; }

	if (suggestionParams.context?.feature instanceof VariableNode) {
		const activeFeature = suggestionParams.context.feature as VariableNode,
			antlersNodes = suggestionParams.antlersDocument.getAllAntlersNodes();

		if (activeFeature.scopeVariable == null || activeFeature.scopeVariable.sourceField == null) {
			return null;
		}

		const similarNodes: AbstractNode[] = [],
			highlights: DocumentHighlight[] = [];

		antlersNodes.forEach((node) => {
			node.runtimeNodes.forEach((runtimeNode) => {
				if (runtimeNode.scopeVariable != null && runtimeNode.scopeVariable == activeFeature.scopeVariable) {
					similarNodes.push(runtimeNode);
				} else {
					if (runtimeNode.scopeVariable != null && runtimeNode.scopeVariable.sourceName == activeFeature.scopeVariable?.sourceName) {
						if (runtimeNode instanceof VariableNode) {
							if (runtimeNode.name == activeFeature.name) {
								similarNodes.push(runtimeNode);
							}
						}
					}
				}
			});
		});

		if (similarNodes.length > 0) {
			similarNodes.push(activeFeature);
		}

		similarNodes.forEach((node) => {
			highlights.push({
				range: nodeToRange(node)
			});
		});

		return highlights;
	}

	return [];
}