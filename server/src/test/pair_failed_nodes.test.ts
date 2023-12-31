import assert from 'assert';
import { AntlersNode, AntlersParserFailNode, CommentParserFailNode, LiteralNode } from '../runtime/nodes/abstractNode.js';
import {
    assertCount,
    assertFalse,
    assertInstanceOf,
    assertNotNull,
    assertTrue,
    toAntlers,
} from "./testUtils/assertions.js";
import { parseNodes, parseRenderNodes } from "./testUtils/parserUtils.js";

suite("Failed Node Tag Pairing", () => {
    test("it can pair incomplete nodes", () => {
        const template = `{{ collection:articles from="" }}
    <p>Hello, wilderness.</p>
{{ /collection:articles `;

        const nodes = parseRenderNodes(template);
        assertCount(1, nodes);
        assertInstanceOf(AntlersNode, nodes[0]);

        const collectionTag = toAntlers(nodes[0]);
        assertNotNull(collectionTag.isClosedBy);
        assertInstanceOf(AntlersParserFailNode, collectionTag.isClosedBy);
        const closingTag = collectionTag.isClosedBy as AntlersParserFailNode;

        assert.strictEqual(collectionTag.getContent(), "collection:articles ");
        assert.strictEqual(closingTag.getContent(), "/collection:articles");
    });

    test("parser can recover from incomplete nodes", () => {
        const template = `{{ collection:articles from="" }}
    <p>Hello, wilderness.</p>
{{ /collection:articles 

{{ collection:next in="blog" as="posts" limit="2" sort="date:asc" }}

{{ if no_results }}
	No more posts to read!
{{ /if }}

{{ posts }}
	<div class="post">
	<a href="{{ url }}">{{ title }}</a>
	</div>
{{ /posts }}

{{ /collection:next }}`;

        const nodes = parseRenderNodes(template);
        assertCount(3, nodes);
        assertInstanceOf(AntlersNode, nodes[0]);
        assertInstanceOf(LiteralNode, nodes[1]);
        assertInstanceOf(AntlersNode, nodes[2]);

        const firstCollection = nodes[0] as AntlersNode,
            secondCollection = nodes[2] as AntlersNode;

        assertNotNull(firstCollection.isClosedBy);
        assertNotNull(secondCollection.isClosedBy);

        assertInstanceOf(AntlersParserFailNode, firstCollection.isClosedBy);
        assertInstanceOf(AntlersNode, secondCollection.isClosedBy);

        const firstClose = firstCollection.isClosedBy as AntlersParserFailNode,
            secondClose = secondCollection.isClosedBy as AntlersNode;

        assert.strictEqual(firstCollection.startPosition?.line, 1);
        assert.strictEqual(firstCollection.endPosition?.line, 1);

        assert.strictEqual(secondCollection.startPosition?.line, 5);
        assert.strictEqual(secondCollection.endPosition?.line, 5);

        assert.strictEqual(firstClose.startPosition?.line, 3);
        assert.strictEqual(firstClose.endPosition?.line, 3);

        assert.strictEqual(secondClose.startPosition?.line, 17);
        assert.strictEqual(secondClose.endPosition?.line, 17);
    });

    test("parser can recover from incomplete comments", () => {
        const template = `{{# 

	Multiline Comment.
	

{{ articles }}
	<p>Test.</p>
{{ /articles 
}}`;

        const nodes = parseRenderNodes(template);
        assertCount(3, nodes);
        assertInstanceOf(CommentParserFailNode, nodes[0]);
        assertInstanceOf(LiteralNode, nodes[1]);
        assertInstanceOf(AntlersNode, nodes[2]);

        const commentNode = nodes[0] as CommentParserFailNode,
            literalNode = nodes[1] as LiteralNode,
            loopNode = nodes[2] as AntlersNode;

        assertTrue(commentNode.isComment);
        assert.strictEqual(commentNode.startPosition?.line, 1);
        assert.strictEqual(commentNode.endPosition?.line, 1);

        assert.strictEqual(literalNode.startPosition?.line, 2);
        assert.strictEqual(literalNode.endPosition?.line, 6);

        assertFalse(literalNode.content.includes("#"));
        assertFalse(literalNode.content.includes("{"));
        assertFalse(literalNode.content.includes("}"));

        assert.strictEqual(loopNode.startPosition?.line, 6);
        assert.strictEqual(loopNode.endPosition?.line, 6);

        assertNotNull(loopNode.isClosedBy);
        assertInstanceOf(AntlersNode, loopNode.isClosedBy);

        const loopClose = loopNode.isClosedBy as AntlersNode;

        assert.strictEqual(loopClose.isOpenedBy, loopNode);

        assert.strictEqual(loopClose.startPosition?.line, 8);
        assert.strictEqual(loopClose.endPosition?.line, 9);
    });

    test("it pairs indented failed nodes", () => {
        const template = `

		{{ test }}
	
		some sample literal content
		{{ /test 
	`;
        const nodes = parseRenderNodes(template);
        assertCount(2, nodes);
        assertInstanceOf(LiteralNode, nodes[0]);
        assertInstanceOf(AntlersNode, nodes[1]);

        const node = nodes[1] as AntlersNode;
        assertNotNull(node.isClosedBy);
        assert.strictEqual(node.startPosition?.line, 3);
        assert.strictEqual(node.endPosition?.line, 3);

        assertInstanceOf(AntlersParserFailNode, node.isClosedBy);
        const closingNode = node.isClosedBy as AntlersParserFailNode;
        assert.strictEqual(closingNode.isOpenedBy, node);
        assertTrue(closingNode._isEndVirtual);
        assert.strictEqual(closingNode.startPosition?.line, 6);
        assert.strictEqual(closingNode.endPosition?.line, 6);
    });
});
