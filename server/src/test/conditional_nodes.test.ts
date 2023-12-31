import assert from 'assert';
import { AntlersNode, LiteralNode, ConditionNode, ExecutionBranch, SemanticGroup, LogicGroup, VariableNode, LogicalOrOperator, EqualCompOperator, StringValueNode } from '../runtime/nodes/abstractNode.js';
import {
    assertConditionalChainContainsSteps,
    assertCount,
    assertInstanceOf,
    assertLiteralNodeContains,
    assertNotNull,
    toAntlers,
    toLiteral,
} from "./testUtils/assertions.js";
import { parseNodes, parseRenderNodes } from "./testUtils/parserUtils.js";

suite("Conditional Nodes Test", () => {
    test("it doesnt skip surrounding nodes", () => {
        const template = `<p>Outer Start</p>
{{ articles }}
<p>start</p>
{{ if title == 'Nectar of the Gods' }}
<p>Inner literal one.</p>
{{ elseif 5 < 10 }}
<p>Inner literal two.</p>
{{ else }}
<p>Else- inner literal three..</p>
{{ /if }}
<p>end</p>
{{ /articles }}
<p>Outer end</p>`;

        const nodes = parseRenderNodes(template);

        assertCount(3, nodes);
        const literalOne = toLiteral(nodes[0]),
            literalTwo = toLiteral(nodes[2]);

        assertLiteralNodeContains(literalOne, "Outer Start");
        assertLiteralNodeContains(literalTwo, "Outer end");

        assertInstanceOf(AntlersNode, nodes[1]);
        const articlesNode = nodes[1] as AntlersNode;
        assert.strictEqual(articlesNode.content, " articles ");

        assertCount(4, articlesNode.children);
        assertInstanceOf(LiteralNode, articlesNode.children[0]);
        assertInstanceOf(ConditionNode, articlesNode.children[1]);
        assertInstanceOf(LiteralNode, articlesNode.children[2]);

        const condition = articlesNode.children[1] as ConditionNode;
        assertCount(3, condition.logicBranches);
        assertCount(3, condition.chain);
        assert.strictEqual(articlesNode, condition.parent);
        assertNotNull(condition.startPosition);
        assertNotNull(condition.endPosition);

        const logicBranches = condition.logicBranches as ExecutionBranch[];
        const firstBranch = logicBranches[0],
            secondBranch = logicBranches[1],
            thirdBranch = logicBranches[2];

        assertCount(2, firstBranch.nodes);

        assertInstanceOf(LiteralNode, firstBranch.nodes[0]);
        const fbLiteralNode = firstBranch.nodes[0] as LiteralNode;
        assertLiteralNodeContains(fbLiteralNode, "Inner literal one.");

        assertInstanceOf(LiteralNode, secondBranch.nodes[0]);
        const sbLiteralNode = secondBranch.nodes[0] as LiteralNode;
        assertLiteralNodeContains(sbLiteralNode, "Inner literal two.");

        assertInstanceOf(LiteralNode, thirdBranch.nodes[0]);
        const tbLiteralNode = thirdBranch.nodes[0] as LiteralNode;
        assertLiteralNodeContains(tbLiteralNode, "Else- inner literal three.");
    });

    test("nested conditions and chains are parsed", () => {
        const template = `<p>Outer Start</p>
{{ articles }}
<p>start</p>
{{ if title == 'Nectar of the Gods' }}
<p>Inner literal one.</p>

{{ if true == true }}
{{ if true == false }}
{{ elseif false == true }}
{{ if abc == 'abc' }}

{{ /if }}
{{ /if }}
{{ else }}

{{ /if }}

{{ elseif 5 < 10 }}
<p>Inner literal two.</p>
{{ else }}
<p>Else- inner literal three..</p>
{{ /if }}
<p>end</p>
{{ /articles }}
<p>Outer end</p>
`;

        const nodes = parseRenderNodes(template);
        assertCount(3, nodes);
        assertInstanceOf(LiteralNode, nodes[0]);
        assertInstanceOf(LiteralNode, nodes[2]);
        const ltNode = nodes[0] as LiteralNode,
            ltNodeTwo = nodes[2] as LiteralNode;
        assertLiteralNodeContains(ltNode, "Outer Start");
        assertLiteralNodeContains(ltNodeTwo, "Outer end");
        assertInstanceOf(AntlersNode, nodes[1]);

        const articlesNode = nodes[1] as AntlersNode;
        assert.strictEqual(articlesNode.content, " articles ");
        assertCount(4, articlesNode.children);

        assertInstanceOf(LiteralNode, articlesNode.children[0]);
        assertInstanceOf(LiteralNode, articlesNode.children[2]);

        const aLitOne = articlesNode.children[0] as LiteralNode,
            aLitTwo = articlesNode.children[2] as LiteralNode;
        assertLiteralNodeContains(aLitOne, "start");
        assertLiteralNodeContains(aLitTwo, "end");
        assertInstanceOf(ConditionNode, articlesNode.children[1]);

        const conditionNode = articlesNode.children[1] as ConditionNode;
        assertCount(3, conditionNode.logicBranches);

        assertConditionalChainContainsSteps(conditionNode, [
            "if title == 'Nectar of the Gods'",
            "elseif 5 < 10",
            "else",
        ]);

        assertCount(4, toAntlers(conditionNode.logicBranches[0].head).children);
        assertCount(2, toAntlers(conditionNode.logicBranches[1].head).children);
        assertCount(2, toAntlers(conditionNode.logicBranches[2].head).children);

        const firstBranch = conditionNode.logicBranches[0];
        assertInstanceOf(LiteralNode, firstBranch.nodes[0]);
        assertInstanceOf(ConditionNode, firstBranch.nodes[1]);
        assertInstanceOf(LiteralNode, firstBranch.nodes[2]);
        const fbLitOne = firstBranch.nodes[0] as LiteralNode;
        assertLiteralNodeContains(fbLitOne, "Inner literal one.");

        const nestedCond1 = firstBranch.nodes[1] as ConditionNode;

        assertConditionalChainContainsSteps(nestedCond1, [
            "if true == true",
            "else",
        ]);

        assertCount(2, nestedCond1.logicBranches);
        assertInstanceOf(AntlersNode, nestedCond1.logicBranches[0].head);
        assertInstanceOf(AntlersNode, nestedCond1.logicBranches[1].head);

        const n1HeadOne = nestedCond1.logicBranches[0].head as AntlersNode,
            n1HeadTwo = nestedCond1.logicBranches[1].head as AntlersNode;
        assertCount(4, n1HeadOne.children);
        assertCount(2, n1HeadTwo.children);

        assertInstanceOf(ConditionNode, n1HeadOne.children[1]);
        const nestedCond2 = n1HeadOne.children[1] as ConditionNode;

        assertConditionalChainContainsSteps(nestedCond2, [
            "if true == false",
            "elseif false == true",
        ]);

        assertInstanceOf(
            ConditionNode,
            (nestedCond2.logicBranches[1].head as AntlersNode)?.children[1]
        );
        const nestedCond3 = (nestedCond2.logicBranches[1].head as AntlersNode)
            ?.children[1] as ConditionNode;
        assertConditionalChainContainsSteps(nestedCond3, ["if abc == 'abc'"]);
    });

    test("unless rewrite sets content", () => {
        const template = `{{ unless true == false }}

{{ /unless }}`;

        const nodes = parseRenderNodes(template);
        assertCount(1, nodes);
        assertInstanceOf(ConditionNode, nodes[0]);
        const fCondNode = nodes[0] as ConditionNode;
        const ifHead = fCondNode.logicBranches[0].head as AntlersNode;

        assert.strictEqual(ifHead.getContent(), " !( true == false ) ");
    });

    test("conditions do not get parsed as modifiers", () => {
        const template = `{{ if is_small_article || collection:handle == 'vacancies' }}{{ /if }}`;
        const nodes = parseNodes(template);

        assertCount(2, nodes);
        assertInstanceOf(AntlersNode, nodes[0]);
        assertInstanceOf(AntlersNode, nodes[1]);

        const firstNode = nodes[0] as AntlersNode;
        assertCount(7, firstNode.runtimeNodes);
        const runtimeNodes = firstNode.parsedRuntimeNodes;
        assertInstanceOf(SemanticGroup, runtimeNodes[0]);
        const outerGroup = runtimeNodes[0] as SemanticGroup;
        assertCount(1, outerGroup.nodes);
        assertInstanceOf(LogicGroup, outerGroup.nodes[0]);
        const logicGroup = outerGroup.nodes[0] as LogicGroup;
        assertInstanceOf(VariableNode, logicGroup.nodes[0]);
        const lgVarOne = logicGroup.nodes[0] as VariableNode;
        assert.strictEqual(lgVarOne.name, "is_small_article");
        assertInstanceOf(LogicalOrOperator, logicGroup.nodes[1]);
        assertInstanceOf(LogicGroup, logicGroup.nodes[2]);

        const lg2 = logicGroup.nodes[2] as LogicGroup;
        assertInstanceOf(VariableNode, lg2.nodes[0]);
        assertInstanceOf(EqualCompOperator, lg2.nodes[1]);
        assertInstanceOf(StringValueNode, lg2.nodes[2]);

        const lg2VarRef = lg2.nodes[0] as VariableNode,
            lg2StrRef = lg2.nodes[2] as StringValueNode;

        assert.strictEqual(lg2VarRef.name, "collection:handle");
        assert.strictEqual(lg2StrRef.value, "vacancies");
    });
});
