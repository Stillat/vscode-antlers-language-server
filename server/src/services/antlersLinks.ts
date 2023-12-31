import { DocumentLink } from "vscode-languageserver-types";
import ProjectManager from '../projects/projectManager.js';
import ReferenceManager from "../references/referenceManager.js";
import { antlersPositionToVsCode } from '../utils/conversions.js';

export class DocumentLinkManager {
    static getDocumentLinks(docPath: string): DocumentLink[] {
        const documentLinks: DocumentLink[] = [];

        if (ProjectManager.instance?.hasStructure()) {
            const references = ReferenceManager.instance?.getPartialReferences(docPath) ?? [];

            for (let i = 0; i < references.length; i++) {
                const thisRef = references[i];

                if (thisRef.hasMethodPart()) {
                    const projectPartial = ProjectManager.instance.getStructure().findRelativeView(thisRef.getMethodNameValue());

                    if (projectPartial != null) {
                        const end = antlersPositionToVsCode(thisRef.nameEndsOn);

                        documentLinks.push({
                            range: {
                                start: antlersPositionToVsCode(thisRef.startPosition),
                                end: {
                                    character: end.character - 2,
                                    line: end.line
                                },
                            },
                            tooltip: "Partial: " + projectPartial.displayName,
                            target: decodeURIComponent(projectPartial.documentUri),
                        });
                    }
                }
            }
        }

        return documentLinks;
    }
}
