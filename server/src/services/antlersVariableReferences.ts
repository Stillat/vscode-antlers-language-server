import { Location, ReferenceParams } from 'vscode-languageserver';;
import { sessionDocuments } from '../languageService/documents.js';
import ProjectManager from '../projects/projectManager.js';
import { makeProviderRequest } from '../providers/providerParameters.js';
import { VariableReferenceManager } from '../references/variableReferenceManager.js';

export function handleReferences(_params: ReferenceParams): Location[] | null {
    if (ProjectManager.instance?.hasStructure() == false) {
        return null;
    }

    const docPath = decodeURIComponent(_params.textDocument.uri);

    if (sessionDocuments.hasDocument(docPath) == false) {
        return null;
    }

    const request = makeProviderRequest(_params.position, docPath);

    return VariableReferenceManager.getReferences(request);
}