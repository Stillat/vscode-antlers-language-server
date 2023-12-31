import assert from 'assert';
import { formatStringWithPrettier } from '../formatting/prettier/utils.js';

suite('Formatter Prettier Front Matter', () => {
    test('formatting can be disabled', async () => {
        const input = `<div><div><div>
{{# format-ignore-start #}}
<div class="dont format me"
another="attribute">
<div>asdf {{     title }}</div>
{{ if that == 'this' }}
    this should not be changed {{ /if    }}
</div>
{{# Embedded comment #}}
{{ noparse }}
        <p>Hello {{ world }}</p>
    {{ /noparse }}
{{# format-ignore-end #}}
</div></div>
</div>


<div><div><div>
<div>
{{# format-ignore-start #}}
one
     two
          three
                {{# format-ignore-end #}}
</div>
</div></div>
</div>`;
        const output = `<div>
    <div>
        <div>
            {{# format-ignore-start #}}
<div class="dont format me"
another="attribute">
<div>asdf {{     title }}</div>
{{ if that == 'this' }}
    this should not be changed {{ /if    }}
</div>
{{# Embedded comment #}}

{{ noparse }}
        <p>Hello {{ world }}</p>
    {{ /noparse }
            {{# format-ignore-end #}}
        </div>
    </div>
</div>

<div>
    <div>
        <div>
            <div>
                {{# format-ignore-start #}}
one
     two
          three
                {{# format-ignore-end #}}
            </div>
        </div>
    </div>
</div>`;
        assert.strictEqual((await formatStringWithPrettier(input)).trim(), output);
    });

    test('repeated formatting of disabled regions does not add extra whitespace', async () => {
        const input = `<div><div><div>
{{# format-ignore-start #}}
<div class="dont format me"
another="attribute">
<div>asdf {{     title }}</div>
{{ if that == 'this' }}
    this should not be changed {{ /if    }}
</div>
{{# Embedded comment #}}
{{ noparse }}
        <p>Hello {{ world }}</p>
    {{ /noparse }}
{{# format-ignore-end #}}
</div></div>
</div>


<div><div><div>
<div>
{{# format-ignore-start #}}
one
     two
          three
                {{# format-ignore-end #}}
</div>
</div></div>
</div>`;
        const output = `<div>
    <div>
        <div>
            {{# format-ignore-start #}}
<div class="dont format me"
another="attribute">
<div>asdf {{     title }}</div>
{{ if that == 'this' }}
    this should not be changed {{ /if    }}
</div>
{{# Embedded comment #}}

{{ noparse }}
        <p>Hello {{ world }}</p>
    {{ /noparse }
            {{# format-ignore-end #}}
        </div>
    </div>
</div>

<div>
    <div>
        <div>
            <div>
                {{# format-ignore-start #}}
one
     two
          three
                {{# format-ignore-end #}}
            </div>
        </div>
    </div>
</div>`;
        let formatted = (await formatStringWithPrettier(input)).trim();

        assert.strictEqual(formatted, output);

        for (let i = 0; i < 5; i++) {
            formatted = await formatStringWithPrettier(formatted);

            assert.strictEqual(formatted, output);
        }
    });
});