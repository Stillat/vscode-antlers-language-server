import assert from 'assert';
import {
    assertCount,
    assertInstanceOf,
    assertNotNull,
    assertTrue,
    toAntlers,
} from "./testUtils/assertions.js";
import { getParsedRuntimeNodes, parseNodes } from "./testUtils/parserUtils.js";
import EnvironmentDetails from "../runtime/runtime/environmentDetails.js";
import { AntlersNode, LiteralNode, SemanticGroup, VariableNode, LogicGroup, EqualCompOperator, ModifierNode, PathNode, VariableReference } from '../runtime/nodes/abstractNode.js';

suite("Basic Node Test", () => {
    test("it returns nodes", () => {
        const nodes = parseNodes("{{ hello }}, World {{ third }}.");

        assertCount(4, nodes);
        assertInstanceOf(AntlersNode, nodes[0]);
        assertInstanceOf(LiteralNode, nodes[1]);
        assertInstanceOf(AntlersNode, nodes[2]);
        assertInstanceOf(LiteralNode, nodes[3]);
    });

    test("it doesnt trim off content start", () => {
        const nodes = parseNodes('{{ meta_title ?? title ?? "No Title Set" }}');

        assert.strictEqual(
            toAntlers(nodes[0]).getContent(),
            ' meta_title ?? title ?? "No Title Set" '
        );
    });

    test("it removes params from node content", () => {
        const nodes = parseNodes('{{ meta_title ?? title ?? "No Title Set" }}');

        assert.strictEqual(
            toAntlers(nodes[0]).getContent(),
            ' meta_title ?? title ?? "No Title Set" '
        );
    });

    test("node name ignores modifier start", () => {
        const nodes = parseNodes("{{ form:handle|upper }}");

        assertCount(1, nodes);
        const node = nodes[0];

        assertInstanceOf(AntlersNode, node);
        assert.strictEqual(toAntlers(node).name?.content, "form:handle");
    });

    test("it removes tags from node content", () => {
        // NOTE: Hello source divers! This is not valid syntax, but is a good test of resolving the inner node content. :)
        const nodes = parseNodes(
            '{{ meta_title["No Title Set"] param="Test" }}{{ /if }}'
        );

        assert.strictEqual(
            toAntlers(nodes[0]).getContent(),
            ' meta_title["No Title Set"] '
        );
    });

    test("it parses simple comments", () => {
        const nodes = parseNodes('{{# {{ collection:count from="articles" }} #}}');
        assertCount(1, nodes);
        assertInstanceOf(AntlersNode, nodes[0]);
        assertTrue(toAntlers(nodes[0]).isComment);
        assert.strictEqual(
            toAntlers(nodes[0]).getContent(),
            ' {{ collection:count from="articles" }} '
        );
    });

    test("it parses full variable names", () => {
        let nodes = getParsedRuntimeNodes(
            '{{ view:test[hello] | upper:test:param:"hello :|" | lower }}'
        ),
            result = nodes[0];

        assertInstanceOf(SemanticGroup, result);

        let group = result as SemanticGroup;
        assertCount(1, group.nodes);

        assertInstanceOf(VariableNode, group.nodes[0]);
        let firstNode = group.nodes[0] as VariableNode;

        assert.strictEqual("view:test[hello]", firstNode.name);
        assertNotNull(firstNode.modifierChain);
        assertCount(2, firstNode.modifierChain?.modifierChain ?? []);

        (nodes = getParsedRuntimeNodes(
            '{{ view:test[view:test[nested:data[more:nested[keys]]]]|upper:test:param:"hello :|"|lower }}'
        )),
            (result = nodes[0]);

        assertInstanceOf(SemanticGroup, result);

        group = result as SemanticGroup;
        assertCount(1, group.nodes);
        assertInstanceOf(VariableNode, group.nodes[0]);
        firstNode = group.nodes[0] as VariableNode;

        assert.strictEqual(
            "view:test[view:test[nested:data[more:nested[keys]]]]",
            firstNode.name
        );
        assertNotNull(firstNode.modifierChain);
        assertCount(2, firstNode.modifierChain?.modifierChain ?? []);
    });

    test("it parses embedded dot paths", () => {
        const nodes = getParsedRuntimeNodes(
            "{{ view:data:test[nested.key[path:path1]] | upper | lower }}"
        );
        const firstResult = nodes[0] as SemanticGroup;
        const result = firstResult.nodes[0] as VariableNode;

        assert.strictEqual(result.name, "view:data:test[nested.key[path:path1]]");
    });

    test("it parses multiple variables separately", () => {
        const nodes = getParsedRuntimeNodes(
            '{{ (view:test[hello] | upper:test:param:"hello :|" | lower) == (view:title|lower)}}'
        );
        assertInstanceOf(SemanticGroup, nodes[0]);

        const outerGroup = nodes[0] as SemanticGroup;
        assertInstanceOf(LogicGroup, outerGroup.nodes[0]);
        const logicGroup = outerGroup.nodes[0] as LogicGroup;
        const result = logicGroup.nodes;

        assertInstanceOf(LogicGroup, result[0]);
        assertInstanceOf(EqualCompOperator, result[1]);
        assertInstanceOf(LogicGroup, result[2]);

        const firstLogicGroup = result[0] as LogicGroup;
        const firstInnerSemanticGroup = firstLogicGroup.nodes[0] as SemanticGroup;
        assertInstanceOf(VariableNode, firstInnerSemanticGroup.nodes[0]);
        const firstVar = firstInnerSemanticGroup.nodes[0] as VariableNode;

        assert.strictEqual(firstVar.name, "view:test[hello]");

        const secondLogicGroup = result[2] as LogicGroup;
        const secondInnerSemanticGroup = secondLogicGroup.nodes[0] as SemanticGroup;
        assertInstanceOf(VariableNode, secondInnerSemanticGroup.nodes[0]);
        const secondVar = secondInnerSemanticGroup.nodes[0] as VariableNode;

        assert.strictEqual(secondVar.name, "view:title");
    });

    test("it parses multiple variables separately with complicated modifiers", () => {
        const nodes = getParsedRuntimeNodes(
            '{{(view:test[hello]|upper:test:param:"hello :|"|lower)==(view:title|lower)}}'
        );
        assertInstanceOf(SemanticGroup, nodes[0]);

        const outerGroup = nodes[0] as SemanticGroup;
        assertInstanceOf(LogicGroup, outerGroup.nodes[0]);
        const logicGroup = outerGroup.nodes[0] as LogicGroup;
        const result = logicGroup.nodes;

        assertInstanceOf(LogicGroup, result[0]);
        assertInstanceOf(EqualCompOperator, result[1]);
        assertInstanceOf(LogicGroup, result[2]);

        const firstLogicGroup = result[0] as LogicGroup;
        const firstInnerSemanticGroup = firstLogicGroup.nodes[0] as SemanticGroup;
        assertInstanceOf(VariableNode, firstInnerSemanticGroup.nodes[0]);
        const firstVar = firstInnerSemanticGroup.nodes[0] as VariableNode;

        assert.strictEqual(firstVar.name, "view:test[hello]");

        const secondLogicGroup = result[2] as LogicGroup;
        const secondInnerSemanticGroup = secondLogicGroup.nodes[0] as SemanticGroup;
        assertInstanceOf(VariableNode, secondInnerSemanticGroup.nodes[0]);
        const secondVar = secondInnerSemanticGroup.nodes[0] as VariableNode;

        assert.strictEqual(secondVar.name, "view:title");
    });

    test("complex variable reference paths are parsed within variable nodes", () => {
        const nodes = getParsedRuntimeNodes(
            "{{ view:data:test[nested.key[path:path1]]|upper|lower }}"
        );
        assertInstanceOf(SemanticGroup, nodes[0]);
        const outerSemanticGroup = nodes[0] as SemanticGroup;
        assertInstanceOf(VariableNode, outerSemanticGroup.nodes[0]);
        const variable = outerSemanticGroup.nodes[0] as VariableNode;

        assert.strictEqual(variable.name, "view:data:test[nested.key[path:path1]]");
        assertNotNull(variable.variableReference);
        assertNotNull(variable.modifierChain);
        assertCount(2, variable.modifierChain?.modifierChain ?? []);

        const modifierChain = variable.modifierChain
            ?.modifierChain as ModifierNode[];
        const modifierOne = modifierChain[0] as ModifierNode,
            modifierTwo = modifierChain[1] as ModifierNode;

        assertNotNull(modifierOne.nameNode);
        assertNotNull(modifierTwo.nameNode);

        assert.strictEqual(modifierOne.nameNode?.name, "upper");
        assert.strictEqual(modifierTwo.nameNode?.name, "lower");

        const parts: (PathNode | VariableReference)[] = variable.variableReference
            ?.pathParts as (PathNode | VariableReference)[];
        assertCount(4, parts);

        assertInstanceOf(PathNode, parts[0]);
        assertInstanceOf(PathNode, parts[1]);
        assertInstanceOf(PathNode, parts[2]);
        assertInstanceOf(VariableReference, parts[3]);

        const pathOne = parts[0] as PathNode,
            pathTwo = parts[1] as PathNode,
            pathThree = parts[2] as PathNode,
            varRef = parts[3] as VariableReference;

        assert.strictEqual(pathOne.delimiter, ":");
        assert.strictEqual(pathOne.name, "view");

        assert.strictEqual(pathTwo.delimiter, ":");
        assert.strictEqual(pathTwo.name, "data");

        assert.strictEqual(pathThree.delimiter, ":");
        assert.strictEqual(pathThree.name, "test");

        assert.strictEqual(varRef.originalContent, "nested.key[path:path1]");
        assertCount(3, varRef.pathParts);

        const refParts: (PathNode | VariableReference)[] = varRef?.pathParts as (
            | PathNode
            | VariableReference
        )[];

        assertInstanceOf(PathNode, refParts[0]);
        assertInstanceOf(PathNode, refParts[1]);
        assertInstanceOf(VariableReference, refParts[2]);

        const refPathOne = refParts[0] as PathNode,
            refPathTwo = refParts[1] as PathNode,
            refVarRef = refParts[2] as VariableReference;

        assert.strictEqual(refPathOne.delimiter, ".");
        assert.strictEqual(refPathOne.name, "nested");

        assert.strictEqual(refPathTwo.delimiter, ".");
        assert.strictEqual(refPathTwo.name, "key");

        assertCount(2, refVarRef.pathParts);
        assert.strictEqual(refVarRef.originalContent, "path:path1");
        assertInstanceOf(PathNode, refVarRef.pathParts[0]);
        assertInstanceOf(PathNode, refVarRef.pathParts[1]);

        const finalPathOne = refVarRef.pathParts[0] as PathNode,
            finalPathTwo = refVarRef.pathParts[1] as PathNode;

        assert.strictEqual(finalPathOne.delimiter, ":");
        assert.strictEqual(finalPathOne.name, "path");

        assert.strictEqual(finalPathTwo.delimiter, ":");
        assert.strictEqual(finalPathTwo.name, "path1");
    });

    test("comments with things that look like antlers dont skip literal nodes", () => {
        const nodes = parseNodes(
            "{{# test comment {{ var }} #}}<p>I am a literal.</p>"
        );

        assertCount(2, nodes);
        assertInstanceOf(AntlersNode, nodes[0]);
        assertInstanceOf(LiteralNode, nodes[1]);

        assert.strictEqual(
            toAntlers(nodes[0]).getContent(),
            " test comment {{ var }} "
        );
        assert.strictEqual(nodes[1].content, "<p>I am a literal.</p>");
    });

    test("neighboring comments dont confuse things", () => {
        const template = `{{# A comment #}}
		{{# another comment {{ width }} #}}
		<div class="max-w-2xl mx-auto mb-32">
		<p>test</p> {{ subtitle }}
		</div>`;
        const nodes = parseNodes(template);
        assertCount(6, nodes);

        assertInstanceOf(AntlersNode, nodes[0]);
        assertInstanceOf(LiteralNode, nodes[1]);
        assertInstanceOf(AntlersNode, nodes[2]);
        assertInstanceOf(LiteralNode, nodes[3]);
        assertInstanceOf(AntlersNode, nodes[4]);
        assertInstanceOf(LiteralNode, nodes[5]);

        assert.strictEqual(toAntlers(nodes[0]).getContent(), " A comment ");
        assert.strictEqual(
            toAntlers(nodes[2]).getContent(),
            " another comment {{ width }} "
        );
        assert.strictEqual(toAntlers(nodes[4]).getContent(), " subtitle ");
    });
});
