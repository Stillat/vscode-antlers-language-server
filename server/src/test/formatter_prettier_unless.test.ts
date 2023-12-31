import assert from 'assert';
import { formatStringWithPrettier } from '../formatting/prettier/utils.js';

suite('Formatter Prettier Unless', () => {    
    test('it does not remove unless else', async () => {
        const output = `<body
    class="flex flex-col min-h-screen bg-white selection:bg-primary selection:text-white {{ unless segment_1 }}home-{{else}}page-{{ /unless }}content"
></body>`;
        assert.strictEqual(
            (await formatStringWithPrettier(`<body class="flex flex-col min-h-screen bg-white selection:bg-primary selection:text-white {{ unless segment_1 }}home-{{else}}page-{{ /unless }}content">`)).trim(),
            output
        );
    });

    test('it rewrites incorrect endunless', async () => {
        const template = `{{ unless 		true}}Inner{{			 endunless }}`,
            expected = `{{ unless true }}
    Inner
{{ /unless }}`;
        assert.strictEqual((await formatStringWithPrettier(template)).trim(), expected);
    });

    test('it emits endunless', async () => {
        const template = `{{ unless 		true}}Inner{{			 /unless }}`,
            expected = `{{ unless true }}
    Inner
{{ /unless }}`;
        assert.strictEqual((await formatStringWithPrettier(template)).trim(), expected);
    });

    test('it emits unless pairs', async () => {
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
        assert.strictEqual((await formatStringWithPrettier(template)).trim(), expected);
    });
});