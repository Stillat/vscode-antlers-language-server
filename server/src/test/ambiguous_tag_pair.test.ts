import assert from 'assert';
import { AntlersNode, LiteralNode } from '../runtime/nodes/abstractNode.js';
import {
    assertCount,
    assertInstanceOf,
    assertNotNull,
    assertNull,
    assertTrue,
    toAntlers,
} from "./testUtils/assertions.js";
import { parseNodes } from "./testUtils/parserUtils.js";

suite("Ambiguous Tag Pair Test", () => {
    test("self closing tags are not considered during matching", () => {
        const template = `{{ array }}
		<p>zero</p>
		{{ array /}}
		<p>one</p>
		{{ array /}}
		<p>two</p>
		{{ /array }}`;

        const parsedNodes = parseNodes(template);

        assertCount(7, parsedNodes);
        assertInstanceOf(AntlersNode, parsedNodes[0]);
        assertNotNull(toAntlers(parsedNodes[0]).isClosedBy);

        assertInstanceOf(LiteralNode, parsedNodes[1]);
        assertInstanceOf(AntlersNode, parsedNodes[2]);
        assertTrue(toAntlers(parsedNodes[2]).isSelfClosing);

        assertInstanceOf(LiteralNode, parsedNodes[3]);
        assertInstanceOf(AntlersNode, parsedNodes[4]);
        assertTrue(toAntlers(parsedNodes[4]).isSelfClosing);

        assertInstanceOf(LiteralNode, parsedNodes[5]);
        assertInstanceOf(AntlersNode, parsedNodes[6]);
        assertNotNull((parsedNodes[6] as AntlersNode).isOpenedBy);
        assert.strictEqual(parsedNodes[0], toAntlers(parsedNodes[6]).isOpenedBy);
    });

    test("tags with similar names match against the compound name", () => {
        const template = `<nav class="flex items-center justify-between flex-wrap py-12 lg:py-24 max-w-5xl mx-auto">
		<div class="text-sm">&copy; {{ now format="Y" }} {{ settings:site_name }}
			–Powered by <a href="https://statamic.com?ref=cool-writings" class="hover:text-teal">Statamic</a></div>
		<div class="flex items-center">
			{{ settings:social }}
				<a href="{{ url }}" class="ml-4" aria-label="{{ name }}" rel="noopener">
					{{ svg :src="icon" class="h-6 w-6 hover:text-teal" }}
				</a>
			{{ /settings:social }}
		</div>
	</nav>`;

        const parsedNodes = parseNodes(template);

        assertCount(15, parsedNodes);
        assertInstanceOf(LiteralNode, parsedNodes[0]);
        assertInstanceOf(AntlersNode, parsedNodes[1]);
        assertNull(toAntlers(parsedNodes[1]).isClosedBy);

        assertInstanceOf(LiteralNode, parsedNodes[2]);
        assertInstanceOf(AntlersNode, parsedNodes[3]);
        assertNull(toAntlers(parsedNodes[3]).isClosedBy);

        assertInstanceOf(LiteralNode, parsedNodes[4]);
        assertInstanceOf(AntlersNode, parsedNodes[5]);
        assertNotNull(toAntlers(parsedNodes[5]).isClosedBy);
        assertNull(toAntlers(parsedNodes[5]).isOpenedBy);
        assert.strictEqual(parsedNodes[13], toAntlers(parsedNodes[5]).isClosedBy);

        assertInstanceOf(LiteralNode, parsedNodes[6]);
        assertInstanceOf(AntlersNode, parsedNodes[7]);
        assertNull(toAntlers(parsedNodes[7]).isOpenedBy);
        assertNull(toAntlers(parsedNodes[7]).isClosedBy);

        assertInstanceOf(LiteralNode, parsedNodes[8]);
        assertInstanceOf(AntlersNode, parsedNodes[9]);
        assertNull((parsedNodes[9] as AntlersNode).isOpenedBy);
        assertNull((parsedNodes[9] as AntlersNode).isClosedBy);

        assertInstanceOf(LiteralNode, parsedNodes[10]);
        assertInstanceOf(AntlersNode, parsedNodes[11]);
        assertNull(toAntlers(parsedNodes[11]).isOpenedBy);
        assertNull(toAntlers(parsedNodes[11]).isClosedBy);

        assertInstanceOf(LiteralNode, parsedNodes[12]);
        assertInstanceOf(AntlersNode, parsedNodes[13]);
        assertNull(toAntlers(parsedNodes[13]).isClosedBy);
        assertNotNull(toAntlers(parsedNodes[13]).isOpenedBy);
        assert.strictEqual(parsedNodes[5], toAntlers(parsedNodes[13]).isOpenedBy);

        assertInstanceOf(LiteralNode, parsedNodes[14]);
    });

    test("parser correctly associates nested collection tag pairs", () => {
        const template = `{{ collection from="blog" }}
		{{ collection :from="related_collection" }}
		  {{ title }}
		{{ /collection }}
	  {{ /collection }}`;

        const nodes = parseNodes(template);

        assertCount(9, nodes);

        const firstCollectionOpen = nodes[0] as AntlersNode,
            firstCollectionClose = nodes[8] as AntlersNode;

        assert.strictEqual(firstCollectionOpen.content, ' collection from="blog" ');
        assert.strictEqual(firstCollectionClose.content, " /collection ");
        assert.strictEqual(firstCollectionOpen.isClosedBy, firstCollectionClose);
        assert.strictEqual(firstCollectionClose.isOpenedBy, firstCollectionOpen);

        const secondCollectionOpen = nodes[2] as AntlersNode,
            secondCollectionClose = nodes[6] as AntlersNode;

        assert.strictEqual(
            secondCollectionOpen.content,
            ' collection :from="related_collection" '
        );
        assert.strictEqual(secondCollectionClose.content, " /collection ");
        assert.strictEqual(secondCollectionOpen.isClosedBy, secondCollectionClose);
        assert.strictEqual(secondCollectionClose.isOpenedBy, secondCollectionOpen);
    });
});
