import assert = require('assert');
import { LiteralNode, AntlersNode, PathNode, VariableReference, ConditionNode, ExecutionBranch, AbstractNode } from '../../runtime/nodes/abstractNode';

export function toLiteral(value: any): LiteralNode {
    return value as LiteralNode;
}

export function toAntlers(value: any): AntlersNode {
    return value as AntlersNode;
}

export function toPath(value: any): PathNode {
    return value as PathNode;
}

export function assertInstanceOf(expected: any, instance: any) {
    assert.strictEqual(instance instanceof expected, true);
}

export function assertNull(value: any) {
    assert.strictEqual(value === null, true);
}

export function assertNotNull(value: any) {
    assert.strictEqual(value !== null, true);
}

export function assertTrue(value: any) {
    assert.strictEqual(value === true, true);
}

export function assertFalse(value: any) {
    assert.strictEqual(value === false, true);
}

export function assertCount(count: number, actual: any[]) {
    assert.strictEqual(actual.length, count);
}

export function assertLiteralNodeContains(node: LiteralNode, text: string) {
    assert.strictEqual(node.content.includes(text), true);
}

export function assertGreaterThan(expected: number, actual: number) {
    assert.strictEqual(actual, actual > expected);
}

export function assertConditionalChainContainsSteps(node: ConditionNode, chain: string[]) {
    let last: AntlersNode | null = null;

    for (let i = 0; i < chain.length; i++) {
        const branch = node.logicBranches[i];

        assertInstanceOf(ExecutionBranch, branch);

        if (last != null) {
            assertNotNull((branch.head as AntlersNode)?.isOpenedBy);
            assert.strictEqual(last, (branch.head as AntlersNode)?.isOpenedBy);
        }

        assertNotNull(branch.head);
        assertInstanceOf(AntlersNode, branch.head);
        assertNotNull((branch.head as AntlersNode)?.isClosedBy);

        assert.strictEqual(branch.head?.content.includes(chain[i]), true);

        last = branch.head as AntlersNode;
    }
}

export function assertNodePosition(node: AbstractNode, startLine: number, startChar: number, endLine: number, endChar: number) {
    assertNotNull(node.startPosition);
    assertNotNull(node.endPosition);
    assert.strictEqual(node.startPosition?.line, startLine, 'Node start line: ' + node.content);
    assert.strictEqual(node.startPosition?.char, startChar, 'Node start char: ' + node.content);

    assert.strictEqual(node.endPosition?.line, endLine, 'Node end line: ' + node.content);
    assert.strictEqual(node.endPosition?.char, endChar, 'Node end char: ' + node.content);
}
