import assert from 'assert';
import { AntlersDocument } from "../runtime/document/antlersDocument.js";
import { CursorContext } from "../runtime/document/contexts/positionContext.js";
import {
    assertFalse,
    assertNotNull,
    assertNull,
    assertTrue,
} from "./testUtils/assertions.js";

suite("General Context", () => {
    test("it resolves general contexts", () => {
        const templateText = `Test start
{{ title ?= 'test' }}
Test end
`;
        const doc = AntlersDocument.fromText(templateText),
            features = doc.cursor.getFeaturesAt(2, 16);

        assertNotNull(features);
        assertNotNull(features?.feature);
        assert.strictEqual(features?.cursorContext, CursorContext.General);
        assertFalse(features.isInParameter);
        assert.strictEqual(features.leftPunctuation, "'");
        assert.strictEqual(features.rightPunctuation, "'");
        assert.strictEqual(features.leftWord, "title");
        assert.strictEqual(features.word, "test");
        assertNull(features.modifierContext);
        assertNull(features.parameterContext);
        assertNotNull(features.generalContext);
        assert.strictEqual(features.char, "s");

        assertFalse(features.generalContext?.isLeftOfOperator);
        assertTrue(features.generalContext?.isRightOfOperator);
    });
});
