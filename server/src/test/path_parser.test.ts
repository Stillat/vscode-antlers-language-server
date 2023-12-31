import assert from 'assert';
import { PathNode, VariableReference } from '../runtime/nodes/abstractNode.js';
import {
    assertCount,
    assertFalse,
    assertInstanceOf,
    assertTrue,
    toPath,
} from "./testUtils/assertions.js";
import { parsePath } from "./testUtils/parserUtils.js";

suite("Path Parser Test", () => {
    test("simple paths are parsed", () => {
        const result = parsePath("var_name");
        assertCount(1, result.pathParts);
        assertInstanceOf(PathNode, result.pathParts[0]);
        assert.strictEqual(toPath(result.pathParts[0]).name, "var_name");
    });

    test("strict variable references are parsed", () => {
        const result = parsePath("$var_name");
        assertTrue(result.isStrictVariableReference);
        assert.strictEqual(toPath(result.pathParts[0]).name, "var_name");
    });

    test("explicit variable references are parsed", () => {
        const result = parsePath("$$var_name");
        assertTrue(result.isStrictVariableReference);
        assertTrue(result.isExplicitVariableReference);
        assert.strictEqual(toPath(result.pathParts[0]).name, "var_name");
    });

    test("it parses complex paths", () => {
        const result = parsePath("view:data:test[nested.key[path:path1]]");
        assertInstanceOf(VariableReference, result);
        assertFalse(result.isStrictVariableReference);
        assertFalse(result.isExplicitVariableReference);
        assertCount(4, result.pathParts);

        assertInstanceOf(PathNode, result.pathParts[0]);
        assertInstanceOf(PathNode, result.pathParts[1]);
        assertInstanceOf(PathNode, result.pathParts[2]);
        assertInstanceOf(VariableReference, result.pathParts[3]);

        const part1 = result.pathParts[0] as PathNode,
            part2 = result.pathParts[1] as PathNode,
            part3 = result.pathParts[2] as PathNode,
            part4 = result.pathParts[3] as VariableReference;

        assert.strictEqual(part1.name, "view");
        assert.strictEqual(part2.name, "data");
        assert.strictEqual(part3.name, "test");

        assertCount(3, part4.pathParts);

        assertInstanceOf(PathNode, part4.pathParts[0]);
        assertInstanceOf(PathNode, part4.pathParts[1]);
        assertInstanceOf(VariableReference, part4.pathParts[2]);

        const nestedPart1 = part4.pathParts[0] as PathNode,
            nestedPart2 = part4.pathParts[1] as PathNode,
            nestedPart3 = part4.pathParts[2] as VariableReference;

        assert.strictEqual(nestedPart1.name, "nested");
        assert.strictEqual(nestedPart2.name, "key");

        assertCount(2, nestedPart3.pathParts);

        assertInstanceOf(PathNode, nestedPart3.pathParts[0]);
        assertInstanceOf(PathNode, nestedPart3.pathParts[1]);

        const subNestedPart1 = nestedPart3.pathParts[0] as PathNode,
            subNestedPart2 = nestedPart3.pathParts[1] as PathNode;

        assert.strictEqual(subNestedPart1.name, "path");
        assert.strictEqual(subNestedPart2.name, "path1");
    });

    test("it parses trailing array accessors", () => {
        const result = parsePath("values[value]");

        assert.strictEqual(result.originalContent, "values[value]");
        assertCount(2, result.pathParts);
        assertInstanceOf(PathNode, result.pathParts[0]);
        assertInstanceOf(VariableReference, result.pathParts[1]);

        const path = result.pathParts[0] as PathNode,
            varRef = result.pathParts[1] as VariableReference;

        assert.strictEqual(path.name, "values");

        assertCount(1, varRef.pathParts);
        assertInstanceOf(PathNode, varRef.pathParts[0]);

        const nestedPath = varRef.pathParts[0] as PathNode;

        assert.strictEqual(nestedPath.name, "value");
    });
});
