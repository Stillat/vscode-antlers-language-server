import assert from 'assert';
import { SemanticGroup, VariableNode, ModifierNode, ModifierValueNode, StringValueNode, ModifierNameNode } from '../runtime/nodes/abstractNode.js';
import {
    assertCount,
    assertInstanceOf,
    assertNotNull,
} from "./testUtils/assertions.js";
import { getParsedRuntimeNodes } from "./testUtils/parserUtils.js";

suite("Node Modifiers Test", () => {
    test("it parses node modifiers", () => {
        const nodes = getParsedRuntimeNodes("{{ title | upper | lower }}");
        assertInstanceOf(SemanticGroup, nodes[0]);
        const outerGroup = nodes[0] as SemanticGroup;
        assertInstanceOf(VariableNode, outerGroup.nodes[0]);
        const varNode = outerGroup.nodes[0] as VariableNode;

        assert.strictEqual(varNode.name, "title");
        assertNotNull(varNode.modifierChain);
        assertCount(2, varNode.modifierChain?.modifierChain ?? []);

        const modifierOne = varNode.modifierChain?.modifierChain[0] as ModifierNode,
            modifierTwo = varNode.modifierChain?.modifierChain[1] as ModifierNode;

        assertModifierName("upper", modifierOne);
        assertModifierName("lower", modifierTwo);
    });

    test("modifiers with underscores", () => {
        const nodes = getParsedRuntimeNodes(
            '{{ title | test_param:test:param:"hello :|" | lower }}'
        );
        assertInstanceOf(SemanticGroup, nodes[0]);
        const outerGroup = nodes[0] as SemanticGroup;
        assertInstanceOf(VariableNode, outerGroup.nodes[0]);

        const varNode = outerGroup.nodes[0] as VariableNode;
        assertNotNull(varNode.modifierChain);
        assertCount(2, varNode.modifierChain?.modifierChain ?? []);
        assert.strictEqual(varNode.name, "title");

        const modifierOne = varNode.modifierChain?.modifierChain[0] as ModifierNode,
            modifierTwo = varNode.modifierChain?.modifierChain[1] as ModifierNode;

        assertModifierName("test_param", modifierOne);
        assertModifierName("lower", modifierTwo);

        assertCount(3, modifierOne.valueNodes);

        assertInstanceOf(ModifierValueNode, modifierOne.valueNodes[0]);
        const valueOne = modifierOne.valueNodes[0] as ModifierValueNode;
        assert.strictEqual(valueOne.value, "test");

        assertInstanceOf(ModifierValueNode, modifierOne.valueNodes[1]);
        const valueTwo = modifierOne.valueNodes[1] as ModifierValueNode;
        assert.strictEqual(valueTwo.value, "param");

        assertInstanceOf(StringValueNode, modifierOne.valueNodes[2]);
        const valueThree = modifierOne.valueNodes[2] as StringValueNode;
        assert.strictEqual(valueThree.value, "hello :|");
    });

    test("modifiers with hyphens", () => {
        const nodes = getParsedRuntimeNodes(
            '{{ title | test-param:test:param:"hello :|" | lower }}'
        );
        assertInstanceOf(SemanticGroup, nodes[0]);
        const outerGroup = nodes[0] as SemanticGroup;

        assertInstanceOf(VariableNode, outerGroup.nodes[0]);
        const varNode = outerGroup.nodes[0] as VariableNode;
        assert.strictEqual(varNode.name, "title");
        assertNotNull(varNode.modifierChain);
        assertCount(2, varNode.modifierChain?.modifierChain ?? []);

        const modifierOne = varNode.modifierChain?.modifierChain[0] as ModifierNode,
            modifierTwo = varNode.modifierChain?.modifierChain[1] as ModifierNode;

        assertModifierName("test-param", modifierOne);
        assertModifierName("lower", modifierTwo);

        assertCount(3, modifierOne.valueNodes);
        assertInstanceOf(ModifierValueNode, modifierOne.valueNodes[0]);
        assertInstanceOf(ModifierValueNode, modifierOne.valueNodes[1]);
        assertInstanceOf(StringValueNode, modifierOne.valueNodes[2]);

        const valueOne = modifierOne.valueNodes[0] as ModifierValueNode,
            valueTwo = modifierOne.valueNodes[1] as ModifierValueNode,
            valueThree = modifierOne.valueNodes[2] as StringValueNode;

        assert.strictEqual(valueOne.name, "test");
        assert.strictEqual(valueTwo.name, "param");
        assert.strictEqual(valueThree.value, "hello :|");
    });

    test("shorthand modifiers can accept complex strings", () => {
        const nodes = getParsedRuntimeNodes(
            '{{ title | modifier:"hello \\"\\ world" }}'
        );
        assertInstanceOf(SemanticGroup, nodes[0]);
        const wrapperNode = nodes[0] as SemanticGroup;

        assertCount(1, wrapperNode.nodes);
        assertInstanceOf(VariableNode, wrapperNode.nodes[0]);

        const varNode = wrapperNode.nodes[0] as VariableNode;
        assert.strictEqual(varNode.name, "title");
        assertNotNull(varNode.modifierChain);
        assertCount(1, varNode.modifierChain?.modifierChain ?? []);

        const modifierOne = varNode.modifierChain?.modifierChain[0] as ModifierNode;
        assertCount(1, modifierOne.valueNodes);

        assertInstanceOf(ModifierValueNode, modifierOne.valueNodes[0]);
        const modifierValue = modifierOne.valueNodes[0] as ModifierValueNode;

        assert.strictEqual(modifierValue.value, 'hello "\\ world');
    });
});

function assertModifierName(name: string, node: ModifierNode) {
    assertNotNull(node.nameNode);
    assertInstanceOf(ModifierNameNode, node.nameNode);
    assert.strictEqual(node.nameNode?.name, name);
}
