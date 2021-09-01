import { DocumentLink } from 'vscode-languageserver-types';
import { ReferenceManager } from '../references/referenceManager';
import { currentStructure } from '../session';

export class DocumentLinkManager {

	static getDocumentLinks(docPath: string): DocumentLink[] {
		const documentLinks: DocumentLink[] = [];

		// Partial references.
		if (currentStructure != null) {
			const references = ReferenceManager.getPartialReferences(docPath);

			for (let i = 0; i < references.length; i++) {
				const thisRef = references[i];

				if (thisRef.methodName != null) {
					const projectPartial = currentStructure.findPartial(thisRef.methodName);

					if (projectPartial != null) {
						documentLinks.push({
							range: {
								start: {
									line: thisRef.startLine,
									character: thisRef.startOffset
								},
								end: {
									line: thisRef.startLine,
									character: thisRef.endOffset
								},
							},
							tooltip: 'Partial: ' + projectPartial.displayName,
							target: decodeURIComponent(projectPartial.documentUri),
							
						});
					}
				}
			}
		}

		return documentLinks;
	}

}
