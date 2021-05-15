import { Hover, HoverParams } from 'vscode-languageserver-protocol';
import { HoverManager } from '../hovers/hoverManager';
import { currentStructure } from '../projects/statamicProject';
import { makeProviderRequest } from '../providers/providerParameters';
import { parserInstances } from '../session';

export function handleDocumentHover(_params: HoverParams): Hover | null {
	if (currentStructure == null) {
		return null;
	}

	const docPath = decodeURIComponent(_params.textDocument.uri);

	if (parserInstances.has(docPath) == false) {
		return null;
	}

	const request = makeProviderRequest(_params.position, docPath);

	return HoverManager.getHover(request);
}
