import assert from 'assert';
import { formatStringWithPrettier } from '../formatting/prettier/utils.js';
import { AntlersNode, ArrayNode, LogicGroup, MethodInvocationNode, SemanticGroup } from '../runtime/nodes/abstractNode.js';
import { DocumentParser } from '../runtime/parser/documentParser.js';
import { formatAntlers } from './testUtils/formatAntlers.js';

suite('Method and Array Syntax', () => {
    test('array arguments parse in every method style', () => {
        const samples = [
            "{{ instance->join(['one', 'two', ['three']]) }}",
            "{{ instance:join(['one', 'two']) }}",
            "{{ instance.join(['one', 'two']) }}"
        ];

        samples.forEach((sample) => {
            const parser = parseWithoutErrors(sample);
            const antlersNode = parser.getNodes()[0] as AntlersNode;
            const semanticGroup = antlersNode.parsedRuntimeNodes[0] as SemanticGroup;
            const methodGroup = semanticGroup.nodes[0] as LogicGroup;
            const invocation = methodGroup.nodes.find((node) => node instanceof MethodInvocationNode) as MethodInvocationNode;

            assert.ok(invocation instanceof MethodInvocationNode);
            assert.ok(invocation.args?.args[0] instanceof ArrayNode);
        });
    });

    test('array accessors remain intact', () => {
        const samples = [
            '{{ posts[1]title }}',
            '{{ posts[1].title }}',
            '{{ posts["key"] }}',
            '{{ posts[true] }}',
            '{{ posts[false] }}',
            '{{ posts[null] }}',
            '{{ view:background["default"] }}'
        ];

        samples.forEach((sample) => {
            parseWithoutErrors(sample);
            assertStableFormatting(sample, sample);
        });
    });

    test('nested shorthand arrays remain compact and stable', () => {
        const sample = "{{ values = ['a' => ['b' => [true, false, null]]] }}";

        parseWithoutErrors(sample);
        assertStableFormatting(sample, sample);
    });

    test('escaped array accessors remain intact', () => {
        const samples = [
            String.raw`{{ test['\\test'] }}`,
            String.raw`{{ test['\ntest'] }}`,
            String.raw`{{ test['\ttest'] }}`,
            String.raw`{{ test['\rtest'] }}`,
            String.raw`{{ test['test[\'test\']'] }}`
        ];

        samples.forEach((sample) => {
            parseWithoutErrors(sample);
            assertStableFormatting(sample, sample);
        });
    });

    test('method accessors remain intact', () => {
        const samples = [
            '{{ $title->length() }}',
            '{{ slot->hasActualContent()->trim() }}',
            '{{ slot.hasActualContent() }}',
            '{{ slot:hasActualContent() }}'
        ];

        samples.forEach((sample) => {
            parseWithoutErrors(sample);
            assertStableFormatting(sample, sample);
        });
    });

    test('multiline colon method chains parse and stabilize', () => {
        const input = `{{
    datetime:parse("October 12, 2001"):
            addDays(10):
            toAtomString()
}}`;
        const expected = '{{ datetime:parse("October 12, 2001"):addDays(10):toAtomString() }}';

        parseWithoutErrors(input);
        assertStableFormatting(input, expected);
    });

    test('attribute method chains with arrays parse and stabilize', () => {
        const input = `<div {{
    attributes.merge([
        'class' => 'hello-there!'
    ])
    .merge([
        'class' => 'another-one'
    ])
}}>x</div>`;
        const expected = "<div {{ attributes.merge(['class' => 'hello-there!']).merge(['class' => 'another-one']) }}>x</div>";

        parseWithoutErrors(input);
        assertStableFormatting(input, expected);
    });

    test('prettier preserves method and array syntax', async () => {
        const samples = [
            "{{ instance->join(['one', 'two']) }}",
            "{{ instance:join(['one', 'two']) }}",
            "{{ instance.join(['one', 'two']) }}",
            '{{ slot->hasActualContent()->trim() }}'
        ];

        for (const sample of samples) {
            const once = (await formatStringWithPrettier(sample)).trim();
            const twice = (await formatStringWithPrettier(once)).trim();

            assert.strictEqual(once, sample);
            assert.strictEqual(twice, sample);
        }
    });
});

function parseWithoutErrors(input: string) {
    const parser = new DocumentParser();
    parser.parse(input);

    assert.deepStrictEqual(
        parser.getAntlersErrors().map((error) => `${error.errorCode}: ${error.message}`),
        []
    );

    return parser;
}

function assertStableFormatting(input: string, expected: string) {
    const once = formatAntlers(input);
    const twice = formatAntlers(once);

    assert.strictEqual(once, expected);
    assert.strictEqual(twice, expected);
}
