import assert from 'assert';
import { AntlersDocument } from '../runtime/document/antlersDocument.js';
import { LiteralNode, AntlersNode } from '../runtime/nodes/abstractNode.js';
import { assertCount, assertInstanceOf, assertNodePosition } from './testUtils/assertions.js';

suite('Positions Tests', () => {
    test('it resolves simple positions', () => {
        const template = `Test start {{ title }} test test
word one {{ subtitle }} two three

four five {{ seo:title }} six
{{ seven }}`,
            doc = AntlersDocument.fromText(template),
            nodes = doc.getAllNodes();

        assertCount(8, nodes);
        assertInstanceOf(LiteralNode, nodes[0]);
        assertInstanceOf(AntlersNode, nodes[1]);
        assertInstanceOf(LiteralNode, nodes[2]);
        assertInstanceOf(AntlersNode, nodes[3]);
        assertInstanceOf(LiteralNode, nodes[4]);
        assertInstanceOf(AntlersNode, nodes[5]);
        assertInstanceOf(LiteralNode, nodes[6]);
        assertInstanceOf(AntlersNode, nodes[7]);

        assertNodePosition(nodes[0], 1, 1, 1, 12);
        assertNodePosition(nodes[1], 1, 12, 1, 22);
        assertNodePosition(nodes[2], 1, 23, 2, 10);
        assertNodePosition(nodes[3], 2, 10, 2, 23);
        assertNodePosition(nodes[4], 2, 24, 4, 11);
        assertNodePosition(nodes[5], 4, 11, 4, 25);
        assertNodePosition(nodes[6], 4, 26, 5, 1);
        assertNodePosition(nodes[7], 5, 1, 5, 11);
    });

    test('it resolves nested interpolation positions', () => {
        const template = `start
    {{ test = {collection:articles paginate="true" limit="{'10' | some_modifier}"} }} end
	
end`;
        const doc = AntlersDocument.fromText(template),
            nodes = doc.getAllNodes();
        assertCount(3, nodes);
        assertInstanceOf(LiteralNode, nodes[0]);
        assertInstanceOf(AntlersNode, nodes[1]);
        assertInstanceOf(LiteralNode, nodes[2]);

        assertNodePosition(nodes[0], 1, 1, 2, 5);
        assertNodePosition(nodes[1], 2, 5, 2, 85);
        assertNodePosition(nodes[2], 2, 86, 4, 3);

        const node = nodes[1] as AntlersNode;

        assert.strictEqual(node.processedInterpolationRegions.size, 1);
        const interpolationNodes = Array.from(node.processedInterpolationRegions, ([name, node]) => node[0]);

        assertCount(1, interpolationNodes);
        assertInstanceOf(AntlersNode, interpolationNodes[0]);

        const nestedCollection = interpolationNodes[0] as AntlersNode;

        assertNodePosition(nestedCollection, 2, 14, 2, 83);

        assert.strictEqual(nestedCollection.processedInterpolationRegions.size, 1);
        const interpolationNodesTwo = Array.from(nestedCollection.processedInterpolationRegions, ([name, node]) => node[0]);

        assertCount(1, interpolationNodesTwo);
        assertInstanceOf(AntlersNode, interpolationNodesTwo[0]);

        const nestedModifierParameter = interpolationNodesTwo[0] as AntlersNode;
        assertNodePosition(nestedModifierParameter, 2, 58, 2, 81);
    });
});