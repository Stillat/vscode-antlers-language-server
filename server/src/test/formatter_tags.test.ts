import assert = require('assert');
import { formatAntlers } from './testUtils/formatAntlers';

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
});