import assert from 'assert';
import { formatAntlers } from './testUtils/formatAntlers.js';

suite('Formatter Unless', () => {    
    test('it does not remove unless else', () => {
        const output = `<body class="flex flex-col min-h-screen bg-white selection:bg-primary selection:text-white {{ unless segment_1 }}home-{{else}}page-{{ /unless }}content">`;
        assert.strictEqual(
            formatAntlers(`<body class="flex flex-col min-h-screen bg-white selection:bg-primary selection:text-white {{ unless segment_1 }}home-{{else}}page-{{ /unless }}content">`),
            output
        );
    });

    test('it rewrites incorrect endunless', () => {
        const template = `{{ unless 		true}}Inner{{			 endunless }}`,
            expected = `{{ unless true }}
    Inner
{{ /unless }}`;
        assert.strictEqual(formatAntlers(template), expected);
    });

    test('it emits endunless', () => {
        const template = `{{ unless 		true}}Inner{{			 /unless }}`,
            expected = `{{ unless true }}
    Inner
{{ /unless }}`;
        assert.strictEqual(formatAntlers(template), expected);
    });

    test('it emits unless pairs', () => {
        const template = `
        Leading Literal
        {{ unless true}}
        <div>A</div>
        {{ elseunless
                 false    }}
        <div>B</div>
        {{ else }}
        <div>C</div>
        {{ /unless }}`;
        const expected = `Leading Literal
{{ unless true }}
    <div>A</div>
{{ elseunless false }}
    <div>B</div>
{{ else }}
    <div>C</div>
{{ /unless }}`;
        assert.strictEqual(formatAntlers(template), expected);
    });
});