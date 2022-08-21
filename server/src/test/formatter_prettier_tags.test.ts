import assert = require('assert');
import { formatStringWithPrettier } from '../formatting/prettier/utils';

suite('Formatter Prettier Tags', () => {   
    test('it respects parameter node value delimiters', () => {
        const input = `{{ partial:components/button as="button" 				label="{ trans:strings.form_send }" 
                                    attribute='x-bind:disabled="sending" x-bind:class="&#123;&#39;opacity-25 cursor-default&#39;: sending&#125;"' }}`;
        const expected = `{{ partial:components/button as="button" label="{trans:strings.form_send}" attribute='x-bind:disabled="sending" x-bind:class="&#123;&#39;opacity-25 cursor-default&#39;: sending&#125;"' }}`;

        assert.strictEqual(formatStringWithPrettier(input).trim(), expected);
    });

    test('it emits all parameters', () => {
        const template = `{{           collection:count                 from="something"  from2="something2"

        from3="something3"
    }}`;
        const output = `{{ collection:count from="something" from2="something2" from3="something3" }}`;
        assert.strictEqual(formatStringWithPrettier(template).trim(), output);
    });

    test('it preserves at params', () => {
        assert.strictEqual(formatStringWithPrettier(`{{				 form:create in="{ form:handle }"
        id="form-{form:handle}"
        
        
        class="flex flex-wrap"
        x-ref="form"
        x-data="sending"
        
        @submit.prevent="sendForm()" }}`).trim(), '{{ form:create in="{form:handle}" id="form-{form:handle}" class="flex flex-wrap" x-ref="form" x-data="sending" @submit.prevent="sendForm()" }}');
    });
    
    test('it does not break randomly on output tags', () => {
        const template = `{{ foreach:array_dynamic }}
        <p>First: {{ first | bool_string }}</p>
        <p>Last: {{ last | bool_string() }}</p>
        <p>Count: {{ count }}</p>
        <p>Evaluated Count: {{ array_dynamic | length }}</p>
        <div>
            <pre>
        Total_Results: {{ total_results }}
        Index: {{ index }}
        Key: {{ key }}
        Value: {{ value }}
        </pre>
        </div>
        ===============================
        {{ /foreach:array_dynamic }}`;
        const output = `{{ foreach:array_dynamic }}
    <p>First: {{ first | bool_string }}</p>
    <p>Last: {{ last | bool_string() }}</p>
    <p>Count: {{ count }}</p>
    <p>Evaluated Count: {{ array_dynamic | length }}</p>
    <div>
        <pre>
        Total_Results: {{ total_results }}
        Index: {{ index }}
        Key: {{ key }}
        Value: {{ value }}
        </pre>
    </div>
    ===============================
{{ /foreach:array_dynamic }}`;
        assert.strictEqual(formatStringWithPrettier(template).trim(), output);
    });

    test('nested tags inside elements', () => {
        const input = `<ul>
{{ loop from="1" to="10" }}
Before Yield
{{ yield:tester }}
After Yield

Before Partial
{{ partial:nested }}
{{ slot:test }}NameStart{{ value }}NameEnd{{ /slot:test }}

Normal Slot Content ({{ value }})
{{ /partial:nested }}
After Partial
{{ /loop }}
</ul>`;
        const output = `<ul>
    {{ loop from="1" to="10" }}
        Before Yield
        {{ yield:tester }}
        After Yield Before Partial
        {{ partial:nested }}
            {{ slot:test }}
                    NameStart{{ value }}NameEnd
            {{ /slot:test }}
            Normal Slot Content ({{ value }})
        {{ /partial:nested }}
        After Partial
    {{ /loop }}
</ul>`;
        assert.strictEqual(formatStringWithPrettier(input).trim(), output);
    });

    test('it emits self closing tags', () => {
        assert.strictEqual(formatStringWithPrettier('{{             test                        /}}').trim(), '{{ test /}}');
    });

    test('it emits interpolation modifier params', () => {
        const template = `{{ default_key|ensure_right:{second_key} }}`;
        const output = `{{ default_key | ensure_right:{second_key} }}`;
        assert.strictEqual(formatStringWithPrettier(template).trim(), output);
    });

    test('it emits recursive nodes', () => {
        const template = `
<ul>{{ recursive_children scope="item" }}<li>{{ item:title }}.{{ item:foo }}.{{ foo }}{{ if item:children }}<ul>{{ *recursive item:children* }}</ul>{{ /if }}</li>{{ /recursive_children }}</ul>
`;
        const output = `<ul>
    {{ recursive_children scope="item" }}
        <li>
            {{ item:title }}.{{ item:foo }}.{{ foo }}
            {{ if item:children }}
                <ul>
                    {{ *recursive item:children* }}
                </ul>
            {{ /if }}
        </li>
    {{ /recursive_children }}
</ul>`;
        assert.strictEqual(formatStringWithPrettier(template).trim(), output);
    });

    test('it does not remove : on simple tags', () => {
        const template = `{{ tag scope="foo" }}
        {{ foo:one }} {{ foo:two }}
        {{ /tag }}`;
        const output = `{{ tag scope="foo" }}
    {{ foo:one }}
    {{ foo:two }}
{{ /tag }}`;
        assert.strictEqual(formatStringWithPrettier(template).trim(), output);
    });

    test('it does not remove : on simple tags 2', () => {
        const template = `{{ tag scope="foo" }}
        {{ foo:one }}
        {{ foo:two }}
        {{ /tag }}`;
        const output = `{{ tag scope="foo" }}
    {{ foo:one }}
    {{ foo:two }}
{{ /tag }}`;
        assert.strictEqual(formatStringWithPrettier(template).trim(), output);
    });
});