import assert = require("assert");
import { AntlersNode, LiteralNode } from '../runtime/nodes/abstractNode';
import {
    assertCount,
    assertInstanceOf,
    assertNotNull,
    assertTrue,
} from "./testUtils/assertions";
import { parseRenderNodes } from "./testUtils/parserUtils";

suite("Antlers Comments", () => {
    test("single line comments", () => {
        const template = `{{# Comment. #}}

{{ articles }}
	<p>Test.</p>
{{ /articles }}`;

        const nodes = parseRenderNodes(template);
        assertCount(3, nodes);

        assertInstanceOf(AntlersNode, nodes[0]);
        assertInstanceOf(LiteralNode, nodes[1]);
        assertInstanceOf(AntlersNode, nodes[2]);

        const comment = nodes[0] as AntlersNode,
            loopPair = nodes[2] as AntlersNode;

        assertTrue(comment.isComment);
        assert.strictEqual(comment.startPosition?.line, 1);
        assert.strictEqual(comment.endPosition?.line, 1);

        assert.strictEqual(loopPair.startPosition?.line, 3);
        assert.strictEqual(loopPair.endPosition?.line, 3);
        assertNotNull(loopPair.isClosedBy);
        assertInstanceOf(AntlersNode, loopPair.isClosedBy);

        const loopClose = loopPair.isClosedBy as AntlersNode;

        assert.strictEqual(loopClose.startPosition?.line, 5);
        assert.strictEqual(loopClose.endPosition?.line, 5);
    });

    test("multiline comments", () => {
        const template = `{{#

	Multiline Comment.
	
#}}

{{ articles }}
	<p>Test.</p>
{{ /articles }}`;

        const nodes = parseRenderNodes(template);
        assertCount(3, nodes);

        assertInstanceOf(AntlersNode, nodes[0]);
        assertInstanceOf(LiteralNode, nodes[1]);
        assertInstanceOf(AntlersNode, nodes[2]);

        const comment = nodes[0] as AntlersNode,
            loopPair = nodes[2] as AntlersNode;

        assertTrue(comment.isComment);
        assert.strictEqual(comment.startPosition?.line, 1);
        assert.strictEqual(comment.endPosition?.line, 5);

        assert.strictEqual(loopPair.startPosition?.line, 7);
        assert.strictEqual(loopPair.endPosition?.line, 7);
        assertNotNull(loopPair.isClosedBy);
        assertInstanceOf(AntlersNode, loopPair.isClosedBy);

        const loopClose = loopPair.isClosedBy as AntlersNode;

        assert.strictEqual(loopClose.startPosition?.line, 9);
        assert.strictEqual(loopClose.endPosition?.line, 9);
    });
});
