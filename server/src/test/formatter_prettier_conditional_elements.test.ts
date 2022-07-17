import assert = require('assert');
import { formatStringWithPrettier } from '../formatting/prettier/utils';

suite('Formatter Prettier Conditional Elements', () => {
    test('it can indent dynamic element echo', () => {
        assert.strictEqual(
            formatStringWithPrettier(`

            <div>
                    <{{ as or 'a' }}
                         class="something">
                <p>Hello {{ as or 'a' }} world.</p>
                    </{{ as or 'a' }}>
                    </div>
            
            `).trim(),
            `<div>
    <{{ as or 'a' }} class="something">
        <p>Hello {{ as or 'a' }} world.</p>
    </{{ as or 'a' }}>
</div>`
        );
    });

    test('it can indent dynamic condition elements', () => {
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
        assert.strictEqual(formatStringWithPrettier(template).trim(), expected);
        assert.strictEqual(formatStringWithPrettier(expected).trim(), expected);
    });

    test('it can indent dynamic unless elements', () => {
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
        assert.strictEqual(formatStringWithPrettier(template).trim(), expected);
        assert.strictEqual(formatStringWithPrettier(expected).trim(), expected);
    });

    test('it can indent dynamic pair elements', () => {
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
        assert.strictEqual(formatStringWithPrettier(template).trim(), expected);
        assert.strictEqual(formatStringWithPrettier(expected).trim(), expected);
    });
});