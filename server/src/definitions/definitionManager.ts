import { DefinitionParams } from "vscode-languageserver-protocol";
import { Location, LocationLink } from "vscode-languageserver-types";
import { ISuggestionRequest } from '../suggestions/suggestionRequest.js';
import { antlersPositionToVsCode } from '../utils/conversions.js';

export class DefinitionManager {
    static findLocations(
        params: ISuggestionRequest | null,
        definitionRequest: DefinitionParams
    ): Location[] | LocationLink[] | null {
        if (params == null) {
            return null;
        }

        if (params.nodesInScope.length == 0) {
            return null;
        }

        let lastSymbolInScope = params.nodesInScope[params.nodesInScope.length - 1];

        if (params.context != null && params.context.node != null) {
            lastSymbolInScope = params.context.node;
        }

        if (lastSymbolInScope != null) {
            if (lastSymbolInScope.scopeVariable != null) {
                if (lastSymbolInScope.scopeVariable.introducedBy != null) {
                    const locations: Location[] = [];

                    locations.push({
                        uri: definitionRequest.textDocument.uri,
                        range: {
                            start: antlersPositionToVsCode(lastSymbolInScope.scopeVariable.introducedBy.startPosition),
                            end: antlersPositionToVsCode(lastSymbolInScope.scopeVariable.introducedBy.endPosition)
                        },
                    });

                    return locations;
                }
            }
        }

        return null;
    }
}
