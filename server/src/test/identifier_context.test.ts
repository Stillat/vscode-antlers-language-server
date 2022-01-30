import { AntlersDocument } from "../runtime/document/antlersDocument";
import { assertFalse, assertNotNull, assertTrue } from "./testUtils/assertions";

suite("Node Identifier Tests", () => {
    const template = `start
{{ collection:articles }}
    {{ test = {collection:articles paginate="true" limit="{'10' | some_modifier}"} }} end

end`;

    test("tag parts can be resolved", () => {
        const doc = AntlersDocument.fromText(template),
            features = doc.cursor.getFeaturesAt(2, 10);

        assertNotNull(features);
        assertTrue(features?.isCursorInIdentifier);
        assertNotNull(features?.identifierContext);
        assertFalse(features?.identifierContext?.inMethodPart);
        assertTrue(features?.identifierContext?.inTagPart);
    });

    test("method parts can be resolved", () => {
        const doc = AntlersDocument.fromText(template),
            features = doc.cursor.getFeaturesAt(2, 19);

        assertNotNull(features);
        assertTrue(features?.isCursorInIdentifier);
        assertNotNull(features?.identifierContext);
        assertTrue(features?.identifierContext?.inMethodPart);
        assertFalse(features?.identifierContext?.inTagPart);
    });
});
