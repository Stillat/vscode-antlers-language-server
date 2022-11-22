import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { checkSymbolForScopeAndAlias } from "../../../scope/factories/listFactory";
import { Scope } from '../../../scope/scope';
import { ICollectionContext } from '../../../types';
import { makeCollectionVariables } from "../../../variables/collectionVariables";
import { getCollectionBlueprintFields } from "./utils";

export function augmentCollectionScope(node: AntlersNode, scope: Scope): Scope {
    if (node.isClosingTag) {
        return scope;
    }

    if (node.hasMethodPart() && node.getMethodNameValue() != "count") {
        scope.addVariables(makeCollectionVariables(node));
    }

    if (node.reference != null) {
        const fields = getCollectionBlueprintFields(node, scope),
            collRef = node.reference as ICollectionContext;
        
        if (fields.length == 0 && collRef.collectionNames.length > 0) {
            fields.push({ blueprintName: collRef.collectionNames[0], displayName: 'Title', import: null, instructionText: '', maxItems: null, name: 'title', type: 'string', refFieldSetField: null, sets: [] });
            fields.push({ blueprintName: collRef.collectionNames[0], displayName: 'Slug', import: null, instructionText: '', maxItems: null, name: 'slug', type: 'string', refFieldSetField: null, sets: [] });
            fields.push({ blueprintName: collRef.collectionNames[0], displayName: 'Date', import: null, instructionText: '', maxItems: null, name: 'date', type: 'string', refFieldSetField: null, sets: [] });
        }

        checkSymbolForScopeAndAlias(node, scope, fields);
    }

    return scope;
}
