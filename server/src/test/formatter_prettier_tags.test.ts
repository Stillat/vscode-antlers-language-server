import assert from 'assert';
import { formatStringWithPrettier } from '../formatting/prettier/utils.js';

suite('Formatter Prettier Tags', () => {   
    test('it respects parameter node value delimiters', async () => {
        const input = `{{ partial:components/button as="button" 				label="{ trans:strings.form_send }" 
                                    attribute='x-bind:disabled="sending" x-bind:class="&#123;&#39;opacity-25 cursor-default&#39;: sending&#125;"' }}`;
        const expected = `{{ partial:components/button as="button" label="{trans:strings.form_send}" attribute='x-bind:disabled="sending" x-bind:class="&#123;&#39;opacity-25 cursor-default&#39;: sending&#125;"' }}`;

        assert.strictEqual((await formatStringWithPrettier(input)).trim(), expected);
    });

    test('it emits all parameters', async () => {
        const template = `{{           collection:count                 from="something"  from2="something2"

        from3="something3"
    }}`;
        const output = `{{ collection:count from="something" from2="something2" from3="something3" }}`;
        assert.strictEqual((await formatStringWithPrettier(template)).trim(), output);
    });

    test('it preserves at params', async () => {
        assert.strictEqual((await formatStringWithPrettier(`{{				 form:create in="{ form:handle }"
        id="form-{form:handle}"
        
        
        class="flex flex-wrap"
        x-ref="form"
        x-data="sending"
        
        @submit.prevent="sendForm()" }}`)).trim(), '{{ form:create in="{form:handle}" id="form-{form:handle}" class="flex flex-wrap" x-ref="form" x-data="sending" @submit.prevent="sendForm()" }}');
    });
    
    test('it does not break randomly on output tags', async () => {
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
        assert.strictEqual((await formatStringWithPrettier(template)).trim(), output);
    });

    test('nested tags inside elements', async () => {
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
        assert.strictEqual((await formatStringWithPrettier(input)).trim(), output);
    });

    test('it emits self closing tags', async () => {
        assert.strictEqual((await formatStringWithPrettier('{{             test                        /}}')).trim(), '{{ test /}}');
    });

    test('it emits interpolation modifier params', async () => {
        const template = `{{ default_key|ensure_right:{second_key} }}`;
        const output = `{{ default_key | ensure_right:{second_key} }}`;
        assert.strictEqual((await formatStringWithPrettier(template)).trim(), output);
    });

    test('it emits recursive nodes', async () => {
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
        assert.strictEqual((await formatStringWithPrettier(template)).trim(), output);
    });

    test('it does not remove : on simple tags', async () => {
        const template = `{{ tag scope="foo" }}
        {{ foo:one }} {{ foo:two }}
        {{ /tag }}`;
        const output = `{{ tag scope="foo" }}
    {{ foo:one }}
    {{ foo:two }}
{{ /tag }}`;
        assert.strictEqual((await formatStringWithPrettier(template)).trim(), output);
    });

    test('it does not remove : on simple tags 2', async () => {
        const template = `{{ tag scope="foo" }}
        {{ foo:one }}
        {{ foo:two }}
        {{ /tag }}`;
        const output = `{{ tag scope="foo" }}
    {{ foo:one }}
    {{ foo:two }}
{{ /tag }}`;
        assert.strictEqual((await formatStringWithPrettier(template)).trim(), output);
    });

    test('it formats inline antlers nodes', async () => {
        const template = `<{{ as or 'a' }}  
{{ slot:attributes }}
class="font-bold">
</{{ as or 'a' }}>`;

        assert.strictEqual((await formatStringWithPrettier(template)).trim(), "<{{ as or 'a' }} {{ slot:attributes }} class=\"font-bold\"></{{ as or 'a' }}>");
    });

    test('it can handle interpolation inside styles', async () => {
        const input = `<div
class="absolute right-0 h-[3px] bg-orange-300"
style="
    {{ horizontal_stripe_position }}: 0px;
"></div>`;
        assert.strictEqual(await formatStringWithPrettier(input), "<div\n    class=\"absolute right-0 h-[3px] bg-orange-300\"\n    style=\"{{ horizontal_stripe_position }}: 0px\"\n></div>\n");
    });

    test('it does not remove escape sequences when formatting attributes inside attributes', async () => {
        const template = `{{ partial:button attr="x-bind:disabled=\\"submitting\\"" }}`;
        const expected = `{{ partial:button attr="x-bind:disabled=\\"submitting\\"" }}`;

        let out = (await formatStringWithPrettier(template)).trim();
        
        assert.strictEqual(out, expected);

        out = (await formatStringWithPrettier(out)).trim();
        
        assert.strictEqual(out, expected);
    });
});