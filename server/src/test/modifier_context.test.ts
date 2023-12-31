import assert from 'assert';
import { AntlersDocument } from "../runtime/document/antlersDocument.js";
import { ModifierContext } from "../runtime/document/contexts/modifierContext.js";
import { CursorContext } from "../runtime/document/contexts/positionContext.js";
import { assertFalse, assertNotNull, assertTrue } from "./testUtils/assertions.js";

suite("Modifier Contexts", () => {
    test("it resolves modifier contexts", () => {
        const templateText = `

{{ collection:articles limit="10" paginate="true" }}
{{ title | upper:param1:param2 }}


`;
        const doc = AntlersDocument.fromText(templateText),
            cursorContext = doc.cursor.getFeaturesAt(4, 29);

        assertNotNull(cursorContext?.modifierContext);
        assert.strictEqual(cursorContext?.cursorContext, CursorContext.Modifier);

        const modifierContext = cursorContext.modifierContext as ModifierContext;
        assert.strictEqual(modifierContext.activeValueIndex, 1);
        assert.strictEqual(modifierContext.valueCount, 2);
        assertFalse(modifierContext.inModifierName);
        assertTrue(modifierContext.inModifierParameter);

        const cursorContext2 = doc.cursor.getFeaturesAt(4, 14);

        assertNotNull(cursorContext2?.modifierContext);
        assert.strictEqual(cursorContext2?.cursorContext, CursorContext.Modifier);

        const modifierContext2 = cursorContext2.modifierContext as ModifierContext;
        assert.strictEqual(modifierContext2.activeValueIndex, -1);
        assert.strictEqual(modifierContext2.valueCount, 2);
        assertTrue(modifierContext2.inModifierName);
        assertFalse(modifierContext2.inModifierParameter);
    });
});
