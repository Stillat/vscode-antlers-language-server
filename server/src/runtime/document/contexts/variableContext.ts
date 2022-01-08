import { replaceAllInString, trimRight } from '../../../utils/strings';
import { AbstractNode, AntlersNode, InlineBranchSeparator, VariableNode } from '../../nodes/abstractNode';
import { Position } from '../../nodes/position';
import { AntlersDocument } from '../antlersDocument';

export class VariableContext {

	public variableNode: VariableNode | null = null;
	public varPathText = '';

	static resolveContext(position: Position, node: AntlersNode, feature: AbstractNode | null, document: AntlersDocument): VariableContext | null {
		if (feature == null) { return null; }

		let featureToCheck = feature;
		const parser = document.getDocumentParser().getLanguageParser(),
			context = new VariableContext(),
			curWord = document.wordAt(position) ?? '';

		if (feature instanceof InlineBranchSeparator && parser.isMergedVariableComponent(feature) == false && feature.prev instanceof VariableNode) {
			featureToCheck = feature.prev;
		}

		let varPathText = '';

		if (parser.isMergedVariableComponent(featureToCheck)) {
			const mergedStructure = parser.getMergedVariable(featureToCheck);

			if (mergedStructure.startPosition != null) {
				varPathText = document.getText(mergedStructure.startPosition.index, position.index).trim();
			}

			context.variableNode = mergedStructure;
		} else if (featureToCheck instanceof VariableNode) {
			context.variableNode = featureToCheck;
			varPathText = featureToCheck.name;

			if (featureToCheck.variableReference != null) {
				varPathText = featureToCheck.variableReference.normalizedReference;
			}
		}

		if (varPathText.length > 0) {
			varPathText = replaceAllInString(varPathText, '\\.', ':');
		}

		const varParts = varPathText.split(':');

		if (curWord.trim().length > 0) {
			varParts.pop();
		}

		varPathText = varParts.join(':');

		if (varPathText.endsWith(':')) {
			varPathText = trimRight(varPathText, ':');
		}

		context.varPathText = varPathText;

		return context;
	}
}