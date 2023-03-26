import assert = require('assert');
import { formatStringWithPrettier } from '../formatting/prettier/utils';

suite('Formatter Prettier Front Matter', () => {
    test('formatting can be disabled', () => {
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
        assert.strictEqual(formatStringWithPrettier(input).trim(), output);
    });

    test('repeated formatting of disabled regions does not add extra whitespace', () => {
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
        let formatted = formatStringWithPrettier(input).trim();

        assert.strictEqual(formatted, output);

        for (let i = 0; i < 5; i++) {
            formatted = formatStringWithPrettier(formatted);

            assert.strictEqual(formatted, output);
        }
    });
});