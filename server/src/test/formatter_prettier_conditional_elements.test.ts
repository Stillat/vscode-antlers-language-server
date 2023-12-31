import assert from 'assert';
import { formatStringWithPrettier } from '../formatting/prettier/utils.js';

suite('Formatter Prettier Conditional Elements', () => {
    test('it can indent dynamic element echo', async () => {
        assert.strictEqual(
            (await formatStringWithPrettier(`

            <div>
                    <{{ as or 'a' }}
                         class="something">
                <p>Hello {{ as or 'a' }} world.</p>
                    </{{ as or 'a' }}>
                    </div>
            
            `)).trim(),
            `<div>
    <{{ as or 'a' }} class="something">
        <p>Hello {{ as or 'a' }} world.</p>
    </{{ as or 'a' }}>
</div>`
        );
    });

    test('it can indent dynamic condition elements', async () => {
        const template = `

<div>
        <{{ if something }}img{{ else }}a{{ /if }}
             class="something">
    <p>Hello  world.</p>
    {{ if something }}img{{ else }}a{{ /if }}
        </{{ if something }}img{{ else }}a{{ /if }}>
        </div>

`,
            expected = `<div>
    <{{ if something }}img{{ else }}a{{ /if }} class="something">
        <p>Hello world.</p>
        {{ if something }}
            img
        {{ else }}
            a
        {{ /if }}
    </{{ if something }}img{{ else }}a{{ /if }}>
</div>`;
        assert.strictEqual((await formatStringWithPrettier(template)).trim(), expected);
        assert.strictEqual((await formatStringWithPrettier(expected)).trim(), expected);
    });

    test('it can indent dynamic unless elements', async () => {
        const template = `

        <div>
                <{{ unless something }}img{{ else }}a{{ /unless }}
                     class="something">
            <p>Hello  world.</p>
            {{ unless something }}img{{ else }}a{{ /unless }}
                </{{ unless something }}img{{ else }}a{{ /unless }}>
                </div>
        
        `,
            expected = `<div>
    <{{ unless something }}img{{ else }}a{{ /unless }} class="something">
        <p>Hello world.</p>
        {{ unless something }}
            img
        {{ else }}
            a
        {{ /unless }}
    </{{ unless something }}img{{ else }}a{{ /unless }}>
</div>`;
        assert.strictEqual((await formatStringWithPrettier(template)).trim(), expected);
        assert.strictEqual((await formatStringWithPrettier(expected)).trim(), expected);
    });

    test('it can indent dynamic pair elements', async () => {
        const template = `

<div>
        <{{ collection:articles }}title{{ /collection:articles }}
             class="something">
    <p>Hello  world.</p>
    {{ collection:articles }}title{{ /collection:articles }}
        </{{ collection:articles }}title{{ /collection:articles }}>
        </div>

`,
        expected = `<div>
    <{{ collection:articles }}title{{ /collection:articles }}
        class="something"
    >
        <p>Hello world.</p>
        {{ collection:articles }}
            title
        {{ /collection:articles }}
    </{{ collection:articles }}title{{ /collection:articles }}>
</div>`;
        assert.strictEqual((await formatStringWithPrettier(template)).trim(), expected);
        assert.strictEqual((await formatStringWithPrettier(expected)).trim(), expected);
    });

    test('nested nodes within conditions do not get corrupted', async () => {
        const input = `<!DOCTYPE html>
        <html>
            <head>
                <title>
                    {{ if ! segment_1 }}
                        {{ something }}
                    {{ /if }}
                </title>
        </head>
        </html>
        
            
            `;
        const output = `<!DOCTYPE html>
<html>
    <head>
        <title>
            {{ if !segment_1 }} {{ something }}{{ /if }}
        </title>
    </head>
</html>`;
        assert.strictEqual((await formatStringWithPrettier(input)).trim(), output);
    });

    test('it doesnt wrap inline ternary', async () => {
        const input = `
            <div class="{{ index % 2 == 0 ? 'order-2' : 'order-1' }} relative"><p>Test</p></div>
            `;
        const expected = `<div class="{{ index % 2 == 0 ? 'order-2' : 'order-1' }} relative">
    <p>Test</p>
</div>`;
        assert.strictEqual((await formatStringWithPrettier(input)).trim(), expected);
    });
});