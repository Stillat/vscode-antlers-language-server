import { DefinitionParams, Location, LocationLink } from 'vscode-languageserver-protocol';
import { DefinitionManager } from '../definitions/definitionManager';
import { currentStructure } from '../projects/statamicProject';
import { makeProviderRequest } from '../providers/providerParameters';
import { parserInstances } from '../session';

export function handleDefinitionRequest(params: DefinitionParams): Location[] | LocationLink[] | null {
	if (currentStructure == null) {
		return null;
	}

	const docPath = decodeURIComponent(params.textDocument.uri);

	if (parserInstances.has(docPath) == false) {
		return null;
	}

	const request = makeProviderRequest(params.position, docPath);

	return DefinitionManager.findLocations(request, params);
}
