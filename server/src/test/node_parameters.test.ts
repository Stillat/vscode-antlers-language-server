import assert from 'assert';
import { AntlersNode, ParameterNode } from '../runtime/nodes/abstractNode.js';
import {
    assertCount,
    assertFalse,
    assertInstanceOf,
    assertTrue,
    toAntlers,
} from "./testUtils/assertions.js";
import { getParsedRuntimeNodes, parseNodes } from "./testUtils/parserUtils.js";

suite("Node Parameters Test", () => {
    test("it parses basic parameters", () => {
        const nodes = parseNodes('{{ date format="Y-m-d\\TH:i:sP" }}');
        assertCount(1, nodes);
        assertInstanceOf(AntlersNode, nodes[0]);
        const node = toAntlers(nodes[0]);

        assertTrue(node.hasParameters);
        assertCount(1, node.parameters);

        const parameterOne = node.parameters[0] as ParameterNode;

        assert.strictEqual(parameterOne.name, "format");
        assert.strictEqual(parameterOne.value, "Y-m-d\\TH:i:sP");
        assertFalse(parameterOne.isVariableReference);
        assertCount(0, parameterOne.interpolations);
    });

    test("parameter details are parsed", () => {
        const nodes = parseNodes(
            '{{ identifier :parameter="value" param="value-two" }}'
        );
        assertCount(1, nodes);
        assertInstanceOf(AntlersNode, nodes[0]);
        const node = toAntlers(nodes[0]);

        assertTrue(node.hasParameters);
        assertCount(2, node.parameters);

        const param1 = node.parameters[0],
            param2 = node.parameters[1];

        assertParameterNameValue(param1, "parameter", "value");
        assertParameterNameValue(param2, "param", "value-two");
    });

    test("variable references are parsed", () => {
        const nodes = parseNodes('{{ identifier :parameter="value" }}');
        assertCount(1, nodes);
        assertInstanceOf(AntlersNode, nodes[0]);
        const node = toAntlers(nodes[0]);

        assertCount(1, node.parameters);
        assertTrue(node.hasParameters);

        const param1 = node.parameters[0];

        assertParameterNameValue(param1, "parameter", "value");
        assertTrue(param1.isVariableReference);
    });

    test("escaped parameter names disable Antlers parsing", () => {
        const nodes = parseNodes('{{ form \\x-data="{ open: false }" \\attr:x-bind="{ value }" }}');
        const node = toAntlers(nodes[0]);

        assertCount(2, node.parameters);
        assert.strictEqual(node.parameters[0].originalName, "\\x-data");
        assert.strictEqual(node.parameters[0].name, "x-data");
        assertTrue(node.parameters[0].containsEscapedContent);
        assert.strictEqual(node.parameters[1].originalName, "\\attr:x-bind");
        assert.strictEqual(node.parameters[1].name, "attr:x-bind");
        assertTrue(node.parameters[1].containsEscapedContent);
    });

    test("bound numeric parameters are literal values", () => {
        const nodes = parseNodes('{{ collection :limit="10" }}');
        const parameter = toAntlers(nodes[0]).parameters[0];

        assert.strictEqual(parameter.originalName, ":limit");
        assert.strictEqual(parameter.name, "limit");
        assertFalse(parameter.isVariableReference);
        assert.strictEqual(parameter.value, "10");
    });

    test("shorthand variable references are parsed", () => {
        const nodes = parseNodes('{{ partial:file/to/partial limit="5" :$shorthandVariable offset="1" }}'),
            node = toAntlers(nodes[0]);

        assertCount(3, node.parameters);

        const shorthand = node.parameters[1];

        assertTrue(shorthand.isShorthand);
        assertTrue(shorthand.isVariableReference);
        assertParameterNameValue(shorthand, "shorthandVariable", "shorthandVariable");
    });

    test("equals followed by space is not a parameter", () => {
        const nodes = parseNodes(
            "{{ is_current || is_parent ?= 'font-medium text-gray-800' }}"
        );
        assertCount(1, nodes);
        assertInstanceOf(AntlersNode, nodes[0]);
        const node = toAntlers(nodes[0]);

        assertCount(0, node.parameters);
        assertFalse(node.hasParameters);
    });

    test("equals followed by invalid char is not a parameter", () => {
        const nodes = parseNodes("{{ title=== 'true' }}");
        assertCount(1, nodes);
        assertInstanceOf(AntlersNode, nodes[0]);

        const node = toAntlers(nodes[0]);
        assertFalse(node.hasParameters);
        assertCount(0, node.parameters);
    });
});

function assertParameterNameValue(
    parameter: ParameterNode,
    name: string,
    value: string
) {
    assert.strictEqual(parameter.name, name);
    assert.strictEqual(parameter.value, value);
}
