import {
    DefinitionParams,
    Location,
    LocationLink,
} from "vscode-languageserver-protocol";
import { DefinitionManager } from "../definitions/definitionManager.js";
import { sessionDocuments } from '../languageService/documents.js';
import ProjectManager from '../projects/projectManager.js';
import { makeProviderRequest } from "../providers/providerParameters.js";

export function handleDefinitionRequest(params: DefinitionParams): Location[] | LocationLink[] | null {
    if (ProjectManager.instance?.hasStructure() == false) {
        return null;
    }

    const docPath = decodeURIComponent(params.textDocument.uri);

    if (sessionDocuments.hasDocument(docPath) == false) {
        return null;
    }

    const request = makeProviderRequest(params.position, docPath);

    return DefinitionManager.findLocations(request, params);
}
