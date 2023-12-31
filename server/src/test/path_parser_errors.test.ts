import assert from 'assert';
import { AntlersErrorCodes } from "../runtime/errors/antlersErrorCodes.js";
import { AntlersNode } from '../runtime/nodes/abstractNode.js';
import { assertCount, assertInstanceOf } from "./testUtils/assertions.js";
import { parseRenderNodes } from "./testUtils/parserUtils.js";

suite("Path Parser Errors Test", () => {
    test("parser can prevent infinite recusion parsing unbalanced accessors", () => {
        const nodes = parseRenderNodes("{{ test[['hello'] }}");
        assertCount(1, nodes);
        assertInstanceOf(AntlersNode, nodes[0]);

        const node = nodes[0] as AntlersNode;
        const errors = node.getErrors();

        assertCount(1, errors);

        assert.strictEqual(
            errors[0].errorCode,
            AntlersErrorCodes.PARSER_CANNOT_PARSE_PATH_RECURSIVE
        );
        assert.strictEqual(errors[0].node, node);
    });

    test("parser detects improper string literals", () => {
        const nodes = parseRenderNodes("{{ test'hello'] }}");

        assertCount(1, nodes);
        assertInstanceOf(AntlersNode, nodes[0]);

        const node = nodes[0] as AntlersNode;
        const errors = node.getErrors();

        assertCount(1, errors);

        assert.strictEqual(
            errors[0].errorCode,
            AntlersErrorCodes.PATH_STRING_NOT_INSIDE_ARRAY_ACCESSOR
        );
        assert.strictEqual(errors[0].node, node);
    });

    

    test("parser does not flag array access false positives", () => {
        const nodes = parseRenderNodes("{{ test['hello']['test'] }}");

        assertCount(1, nodes);
        assertInstanceOf(AntlersNode, nodes[0]);

        const node = nodes[0] as AntlersNode;
        const errors = node.getErrors();

        assertCount(0, errors);
    });
});
