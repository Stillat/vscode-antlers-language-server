import { AntlersDocument } from '../../runtime/document/antlersDocument';
import { AntlersError, ErrrorLevel } from '../../runtime/errors/antlersError';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes';
import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IDocumentDiagnosticsHandler } from '../documentHandler';

const DuplicateNeighboringTags: IDocumentDiagnosticsHandler = {
	checkDocument(document: AntlersDocument) {
		const errors: AntlersError[] = [];
		let lastNode: AntlersNode | null = null;

		document.getAllAntlersNodes().forEach((node) => {
			if (lastNode == null && node.isTagNode) {
				lastNode = node;
				return;
			}

			if (node.isClosingTag) {
				return;
			}

			if (lastNode != null && lastNode.isTagNode && node.isTagNode) {
				if (lastNode.getContent().trim() == node.getContent().trim()) {
					errors.push(AntlersError.makeSyntaxError(
						AntlersErrorCodes.LINT_DUPLICATE_CODE,
						node,
						'Duplicate code detected',
						ErrrorLevel.Warning
					));
				}

				lastNode = node;
			}
		});

		return errors;
	}
};

export default DuplicateNeighboringTags;
