import assert = require("assert");
import { AntlersDocument } from "../runtime/document/antlersDocument";
import { ParameterContext } from '../runtime/document/contexts/parameterContext';
import { CursorContext } from '../runtime/document/contexts/positionContext';
import { ParameterNode } from '../runtime/nodes/abstractNode';
import {
    assertFalse,
    assertInstanceOf,
    assertNotNull,
    assertNull,
    assertTrue,
} from "./testUtils/assertions";

suite("Parameter Context", () => {
    test("it resolve parameter contexts", () => {
        const templateText = `Test start
{{ collection:articles :paginate="true" }}
	<p>Hello</p>
{{ /collection:articles }}
Test end
`;
        const doc = AntlersDocument.fromText(templateText),
            features = doc.cursor.getFeaturesAt(2, 28);

        assertNotNull(features);
        assert.strictEqual(features?.cursorContext, CursorContext.Parameter);
        assert.strictEqual(features?.char, "i");
        assert.strictEqual(features.leftWord, "articles");
        assert.strictEqual(features.leftPunctuation, ":");
        assertTrue(features.isInParameter);
        assert.strictEqual(features?.rightPunctuation, "=");
        assert.strictEqual(features.rightWord, "true");
        assert.strictEqual(features.word, "paginate");

        assertNotNull(features.parameterContext);
        assertNotNull(features.feature);
        assertInstanceOf(ParameterNode, features.feature);
        assertNull(features.modifierContext);

        const paramContext = features.parameterContext as ParameterContext;

        assertFalse(paramContext.isInValue);
        assertTrue(paramContext.isInName);
        assert.strictEqual(paramContext.parameter, features.feature);
        assert.strictEqual(paramContext.parameter?.name, "paginate");
        assertTrue(paramContext.parameter.isVariableReference);
        assert.strictEqual(paramContext.parameter.value, "true");

        const features2 = doc.cursor.getFeaturesAt(2, 37);

        assertNotNull(features2);
        assert.strictEqual(features2?.cursorContext, CursorContext.Parameter);
        assert.strictEqual(features2?.char, "u");
        assert.strictEqual(features2.leftWord, "paginate");
        assert.strictEqual(features2.leftPunctuation, '"');
        assertTrue(features2.isInParameter);
        assert.strictEqual(features2?.rightPunctuation, '"');
        assertNull(features2.rightWord);
        assert.strictEqual(features2.word, "true");

        assertNotNull(features2.parameterContext);
        assertNotNull(features2.feature);
        assertInstanceOf(ParameterNode, features2.feature);
        assertNull(features2.modifierContext);

        const paramContext2 = features2.parameterContext as ParameterContext;

        assertTrue(paramContext2.isInValue);
        assertFalse(paramContext2.isInName);
        assert.strictEqual(paramContext2.parameter, features2.feature);
        assert.strictEqual(paramContext2.parameter?.name, "paginate");
        assertTrue(paramContext2.parameter.isVariableReference);
        assert.strictEqual(paramContext2.parameter.value, "true");
    });
});
