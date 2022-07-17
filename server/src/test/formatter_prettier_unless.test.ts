import assert = require('assert');
import { formatStringWithPrettier } from '../formatting/prettier/utils';

suite('Formatter Prettier Unless', () => {    
    test('it does not remove unless else', () => {
        const output = `<body
    class="selection:bg-primary {{ unless segment_1 }}home-{{else}}page-{{ /unless }}content flex min-h-screen flex-col bg-white selection:text-white"
></body>`;
        assert.strictEqual(
            formatStringWithPrettier(`<body class="flex flex-col min-h-screen bg-white selection:bg-primary selection:text-white {{ unless segment_1 }}home-{{else}}page-{{ /unless }}content">`).trim(),
            output
        );
    });

    test('it rewrites incorrect endunless', () => {
        const template = `{{ unless 		true}}Inner{{			 endunless }}`,
            expected = `{{ unless true }}
    Inner
{{ /unless }}`;
        assert.strictEqual(formatStringWithPrettier(template).trim(), expected);
    });

    test('it emits endunless', () => {
        const template = `{{ unless 		true}}Inner{{			 /unless }}`,
            expected = `{{ unless true }}
    Inner
{{ /unless }}`;
        assert.strictEqual(formatStringWithPrettier(template).trim(), expected);
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
        assert.strictEqual(formatStringWithPrettier(template).trim(), expected);
    });
});