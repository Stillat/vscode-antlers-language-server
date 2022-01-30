import {
    DefinitionParams,
    Location,
    LocationLink,
} from "vscode-languageserver-protocol";
import { DefinitionManager } from "../definitions/definitionManager";
import { sessionDocuments } from '../languageService/documents';
import ProjectManager from '../projects/projectManager';
import { makeProviderRequest } from "../providers/providerParameters";

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
