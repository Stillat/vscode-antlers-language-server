import { Hover, HoverParams } from "vscode-languageserver-protocol";
import { HoverManager } from "../hovers/hoverManager.js";
import { sessionDocuments } from '../languageService/documents.js';
import ProjectManager from '../projects/projectManager.js';
import { makeProviderRequest } from "../providers/providerParameters.js";

export function handleDocumentHover(_params: HoverParams): Hover | null {
    if (ProjectManager.instance?.hasStructure() == false) {
        return null;
    }

    const docPath = decodeURIComponent(_params.textDocument.uri);

    if (sessionDocuments.hasDocument(docPath) == false) {
        return null;
    }

    const request = makeProviderRequest(_params.position, docPath);

    return HoverManager.getHover(request);
}
