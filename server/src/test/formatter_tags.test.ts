import assert from 'assert';
import { formatAntlers } from './testUtils/formatAntlers.js';

suite('Formatter Tags', () => {   
    test('it respects parameter node value delimiters', () => {
        const input = `{{ partial:components/button as="button" 				label="{ trans:strings.form_send }" 
                                    attribute='x-bind:disabled="sending" x-bind:class="&#123;&#39;opacity-25 cursor-default&#39;: sending&#125;"' }}`;
        const expected = `{{ partial:components/button as="button" label="{trans:strings.form_send}" attribute='x-bind:disabled="sending" x-bind:class="&#123;&#39;opacity-25 cursor-default&#39;: sending&#125;"' }}`;

        assert.strictEqual(formatAntlers(input), expected);
    });

    test('it emits all parameters', () => {
        const template = `{{           collection:count                 from="something"  from2="something2"

        from3="something3"
    }}`;
        const output = `{{ collection:count from="something" from2="something2" from3="something3" }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('it preserves at params', () => {
        assert.strictEqual(formatAntlers(`{{				 form:create in="{ form:handle }"
        id="form-{form:handle}"
        
        
        class="flex flex-wrap"
        x-ref="form"
        x-data="sending"
        
        @submit.prevent="sendForm()" }}`), '{{ form:create in="{form:handle}" id="form-{form:handle}" class="flex flex-wrap" x-ref="form" x-data="sending" @submit.prevent="sendForm()" }}');
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
        Value: {{ value }}</pre>
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
            Value: {{ value }}</pre>
    </div>
    ===============================
{{ /foreach:array_dynamic }}`;
        assert.strictEqual(formatAntlers(template), output);
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
        After Yield

        Before Partial
        {{ partial:nested }}
            {{ slot:test }}
                NameStart{{ value }}NameEnd
            {{ /slot:test }}

            Normal Slot Content ({{ value }})
        {{ /partial:nested }}
        After Partial
    {{ /loop }}
</ul>`;
        assert.strictEqual(formatAntlers(input), output);
    });

    test('it emits self closing tags', () => {
        assert.strictEqual(formatAntlers('{{             test                        /}}'), '{{ test /}}');
    });

    test('it emits interpolation modifier params', () => {
        const template = `{{ default_key|ensure_right:{second_key} }}`;
        const output = `{{ default_key | ensure_right:{second_key} }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('it emits recursive nodes', () => {
        const template = `
<ul>{{ recursive_children scope="item" }}<li>{{ item:title }}.{{ item:foo }}.{{ foo }}{{ if item:children }}<ul>{{ *recursive item:children* }}</ul>{{ /if }}</li>{{ /recursive_children }}</ul>
`;
        const output = `<ul>
    {{ recursive_children scope="item" }}
        <li>{{ item:title }}.{{ item:foo }}.{{ foo }}
            {{ if item:children }}
                <ul>{{ *recursive item:children* }}</ul>
            {{ /if }}
        </li>
    {{ /recursive_children }}
</ul>`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('it does not remove : on simple tags', () => {
        const template = `{{ tag scope="foo" }}
        {{ foo:one }} {{ foo:two }}
        {{ /tag }}`;
        const output = `{{ tag scope="foo" }}
    {{ foo:one }}
    {{ foo:two }}
{{ /tag }}`;
        assert.strictEqual(formatAntlers(template), output);
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
        assert.strictEqual(formatAntlers(template), output);
    });

    test('it does not aggressively wrap modifier arguments', () => {
        const input = `{{ article | raw | where('type', 'paragraph') | bard_text | safe_truncate(180, '...') | entities | mark }}`;
        assert.strictEqual(formatAntlers(input), input);
    });

    test('it doesnt duplicate array values with strings', () => {
        assert.strictEqual(formatAntlers(`{{ view:background['default'] }}`).trim(), `{{ view:background['default'] }}`);
        assert.strictEqual(formatAntlers(`{{ not_view:background['default'] }}`).trim(), `{{ not_view:background['default'] }}`);
        assert.strictEqual(formatAntlers(`{{ view:background['default']['one'] }}`).trim(), `{{ view:background['default']['one'] }}`);
        assert.strictEqual(formatAntlers(`{{ view:background['default'].{test}.one }}`).trim(), `{{ view:background['default'].{test}.one }}`);
        assert.strictEqual(formatAntlers(`{{ view:background['default'].1.['one'] }}`).trim(), `{{ view:background['default'].1.['one'] }}`);
        assert.strictEqual(formatAntlers(`{{ view:background['default']['one'] + 'that' }}`).trim(), `{{ view:background['default']['one'] + 'that' }}`);
        assert.strictEqual(formatAntlers(`{{ view:background[default] }}`).trim(), `{{ view:background[default] }}`);
    });
});