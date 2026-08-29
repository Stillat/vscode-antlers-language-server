import { DocumentLink } from "vscode-languageserver-types";
import { getViewName } from "../antlers/tags/core/partials/partialUtilities.js";
import ProjectManager from '../projects/projectManager.js';
import { IProjectDetailsProvider } from "../projects/projectDetailsProvider.js";
import ReferenceManager from "../references/referenceManager.js";
import { AntlersNode } from "../runtime/nodes/abstractNode.js";
import { antlersPositionToVsCode } from '../utils/conversions.js';

export function makePartialDocumentLink(node: AntlersNode, project: IProjectDetailsProvider): DocumentLink | null {
    const viewName = getViewName(node);

    if (viewName == null || viewName.length == 0) {
        return null;
    }

    const srcParameter = node.findParameter("src");

    if (!node.hasMethodPart() && (srcParameter == null || !srcParameter.containsSimpleValue())) {
        return null;
    }

    const projectPartial = project.findRelativeView(viewName);

    if (projectPartial == null) {
        return null;
    }

    if (node.hasMethodPart()) {
        const end = antlersPositionToVsCode(node.nameEndsOn);

        return {
            range: {
                start: antlersPositionToVsCode(node.startPosition),
                end: {
                    character: end.character - 2,
                    line: end.line
                },
            },
            tooltip: "Partial: " + projectPartial.displayName,
            target: decodeURIComponent(projectPartial.documentUri),
        };
    }

    if (srcParameter?.valuePosition == null) {
        return null;
    }

    return {
        range: {
            start: antlersPositionToVsCode(srcParameter.valuePosition.start),
            end: antlersPositionToVsCode(srcParameter.valuePosition.end),
        },
        tooltip: "Partial: " + projectPartial.displayName,
        target: decodeURIComponent(projectPartial.documentUri),
    };
}

export class DocumentLinkManager {
    static getDocumentLinks(docPath: string): DocumentLink[] {
        const documentLinks: DocumentLink[] = [];

        if (ProjectManager.instance?.hasStructure()) {
            const references = ReferenceManager.instance?.getPartialReferences(docPath) ?? [];

            for (let i = 0; i < references.length; i++) {
                const thisRef = references[i];
                const documentLink = makePartialDocumentLink(thisRef, ProjectManager.instance.getStructure());

                if (documentLink != null) {
                    documentLinks.push(documentLink);
                }
            }
        }

        return documentLinks;
    }
}
