import assert from 'assert';
import { formatAntlers } from './testUtils/formatAntlers.js';

suite('Formatter Aggresive Identation', () => {
    test('auto line cleanup is not too aggressive', () => {
        assert.strictEqual(
            formatAntlers(`<div>
<div>
test
</div>

{{ collection:blog }}
test
{{ /collection:blog }}

<div>
test
</div>

{{ collection:articles }}
test
{{ /collection:articles }}

</div>
<div>
<div>
test
</div>
{{ collection:blog }}
test
{{ /collection:blog }}
<div>
test
</div>
{{ collection:articles }}
test
{{ /collection:articles }}
</div>`),
            `<div>
    <div>
        test
    </div>

    {{ collection:blog }}
        test
    {{ /collection:blog }}

    <div>
        test
    </div>

    {{ collection:articles }}
        test
    {{ /collection:articles }}

</div>
<div>
    <div>
        test
    </div>
    {{ collection:blog }}
        test
    {{ /collection:blog }}
    <div>
        test
    </div>
    {{ collection:articles }}
        test
    {{ /collection:articles }}
</div>`
        );
    });
});