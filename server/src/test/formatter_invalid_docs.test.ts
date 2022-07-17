import assert = require('assert');
import { formatAntlers } from './testUtils/formatAntlers';

suite('Formatting Invalid Docs', () => {
    test('it does not attempt to format documents with unclosed regions', () => {
        const input = `<head>
        {{ if something }}
                {{ seo:_pro 
        {{ /if }}
        </head>`;

        for (let i = 0; i < 10; i++) {
            assert.strictEqual(formatAntlers(input), input);
        }
    });

    test('it will not format documents with interleaved tags', () => {
        const template = `{{# {{ partial:layouts/some-layout }} #}}
        {{ section:intro }}
        {{ partial:intro }}
        {{ /section:intro }}
        {{ partial:background }}
            {{# code #}}
        {{ /partial:intro }}`;

        assert.strictEqual(formatAntlers(template), template);
    });

    test('it exits early on unpaired if/elseif structures', () => {
        const template = `---
hello: wilderness
---
A
{{ if 		true}}Inner{{ elseif false }}

B`;
        assert.strictEqual(formatAntlers(template), template);
    });

    test('it exits early on unpaired unless structures', () => {
        const template = `---
hello: wilderness
---

{{ unless 		true}}Inner`;
        assert.strictEqual(formatAntlers(template), template);
    });

    test('it exits early on unpaired if structures', () => {
        const template = `---
hello: wilderness
---
A
{{ if 		true}}Inner

B`;
        assert.strictEqual(formatAntlers(template), template);
    });
});