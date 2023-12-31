import assert from 'assert';
import { formatAntlers } from './testUtils/formatAntlers.js';

suite('Formatter Conditional Elements', () => {
    test('it can indent dynamic element echo', () => {
        assert.strictEqual(
            formatAntlers(`

            <div>
                    <{{ as or 'a' }}
                         class="something">
                <p>Hello {{ as or 'a' }} world.</p>
                    </{{ as or 'a' }}>
                    </div>
            
            `),
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
        assert.strictEqual(formatAntlers(template), expected);
        assert.strictEqual(formatAntlers(expected), expected);
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
        assert.strictEqual(formatAntlers(template), expected);
        assert.strictEqual(formatAntlers(expected), expected);
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
    <{{ collection:articles }}title{{ /collection:articles }} class="something">
        <p>Hello world.</p>
        {{ collection:articles }}
            title
        {{ /collection:articles }}
    </{{ collection:articles }}title{{ /collection:articles }}>
</div>`;
        assert.strictEqual(formatAntlers(template), expected);
        assert.strictEqual(formatAntlers(expected), expected);
    });
});