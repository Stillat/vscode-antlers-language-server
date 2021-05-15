import { DefinitionParams } from 'vscode-languageserver-protocol';
import { Location, LocationLink } from 'vscode-languageserver-types';
import { ISuggestionRequest } from '../suggestions/suggestionManager';

export class DefinitionManager {

	static findLocations(params: ISuggestionRequest, definitionRequest: DefinitionParams): Location[] | LocationLink[] | null {
		if (params.symbolsInScope.length == 0) {
			return null;
		}

		const lastSymbolInScope = params.symbolsInScope[params.symbolsInScope.length - 1];

		if (lastSymbolInScope != null) {
			if (lastSymbolInScope.scopeVariable != null) {
				if (lastSymbolInScope.scopeVariable.introducedBy != null) {
					const locations: Location[] = [];

					locations.push({
						uri: definitionRequest.textDocument.uri,
						range: {
							start: {
								line: lastSymbolInScope.scopeVariable.introducedBy.startLine,
								character: lastSymbolInScope.scopeVariable.introducedBy.startOffset
							},
							end: {
								line: lastSymbolInScope.scopeVariable.introducedBy.endLine,
								character: lastSymbolInScope.scopeVariable.introducedBy.endOffset
							}
						}
					});

					return locations;
				}
			}
		}

		return null;
	}

}