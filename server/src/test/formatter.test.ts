import assert = require('assert');
import { AntlersFormatter } from '../formatting/antlersFormatter';
import { AntlersFormattingOptions } from '../formatting/antlersFormattingOptions';
import { IHTMLFormatConfiguration } from '../formatting/htmlCompat';
import { AntlersDocument } from '../runtime/document/antlersDocument';

const htmlOptions: IHTMLFormatConfiguration = {
    wrapLineLength: 500,

};
const antlersOptions: AntlersFormattingOptions = {
    htmlOptions: htmlOptions,
    tabSize: 4,
    insertSpaces: true,
    formatFrontMatter: true,
    maxStatementsPerLine: 3,
    formatExtensions: []
};

const antlersOptionsDefault: AntlersFormattingOptions = {
    htmlOptions: {},
    tabSize: 4,
    insertSpaces: true,
    formatFrontMatter: true,
    maxStatementsPerLine: 3,
    formatExtensions: []
};

function format(text: string): string {
    const doc = AntlersDocument.fromText(text),
        formatter = new AntlersFormatter(antlersOptions);

    return formatter.formatDocument(doc);
}

function formatDefaultHtmlSettings(text: string): string {
    const doc = AntlersDocument.fromText(text),
        formatter = new AntlersFormatter(antlersOptionsDefault);

    return formatter.formatDocument(doc);
}

function assertFormattedMatches(input: string, output: string) {
    assert.strictEqual(formatDefaultHtmlSettings(input), output);
}

suite("Document Formatting Test", () => {



    test('it emits self closing tags', () => {
        assert.strictEqual(format('{{             test                        /}}'), '{{ test /}}');
    });

    test('it emits interpolation modifier params', () => {
        const template = `{{ default_key|ensure_right:{second_key} }}`;
        const output = `{{ default_key | ensure_right:{second_key} }}`;
        assert.strictEqual(format(template), output);
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
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('it preserves literal node order', () => {
        const template = `{{ tag as="stuff" }}
        before
        {{ stuff }}
        {{ foo }}
        {{ /stuff }}
        after
        {{ /tag }}`;
        const output = `{{ tag as="stuff" }}
    before
    {{ stuff }}
        {{ foo }}
    {{ /stuff }}
    after
{{ /tag }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('it produces reasonable indentation on documents without HTML elements', () => {
        const template = `{{ food }} {{ drink }}
{{ array scope="s" }}
-{{ s:food }}- {{ s:drink }} {{ food }} {{ drink }}
{{ /array }}`;
        const output = `{{ food }} {{ drink }}
{{ array scope="s" }}
    -{{ s:food }}- {{ s:drink }}
    {{ food }} {{ drink }}
{{ /array }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('it produces reasonable indentation on documents without HTML elements 2', () => {
        const template = `{{ drink }} {{ food }} {{ activity }}
{{ tag }}{{ drink }} {{ food }} -{{ activity }}-{{ /tag }}`;
        const output = `{{ drink }} {{ food }}
{{ activity }}
{{ tag }}
    {{ drink }} {{ food }}
    -{{ activity }}-
{{ /tag }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('it produces reasonable indentation on documents with many nested Antlers regions', () => {
        const template = `{{ scope:test }}
drink: {{ drink }}
food: {{ food }}
activity: {{ activity }}

{{ array }}
    array:drink: {{ drink }}
    array:food: {{ food }}
    array:activity: -{{ activity }}-
    array:test:drink: {{ test:drink }}
    array:test:food: {{ test:food }}
    array:test:activity: {{ test:activity }}
{{ /array }}
{{ /scope:test }}`;
        const output = `{{ scope:test }}
    drink: {{ drink }}
    food: {{ food }}
    activity: {{ activity }}

    {{ array }}
        array:drink: {{ drink }}
        array:food: {{ food }}
        array:activity: -{{ activity }}-
        array:test:drink: {{ test:drink }}
        array:test:food: {{ test:food }}
        array:test:activity: {{ test:activity }}
    {{ /array }}
{{ /scope:test }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('default HTML settings does not randomly break on simple Antlers regions', () => {
        const template = `var: {{ drink }}
        page: {{ page:drink }}
        global: {{ global:drink }}
        menu: {{ menu:drink }}
        nested: {{ nested:drink }}
        augmented: {{ augmented:drink }}
        nested augmented: {{ nested:augmented:drink }}`;
        const output = `var: {{ drink }}
page: {{ page:drink }}
global: {{ global:drink }}
menu: {{ menu:drink }}
nested: {{ nested:drink }}
augmented: {{ augmented:drink }}
nested augmented: {{ nested:augmented:drink }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('it does not remove : on simple tags', () => {
        const template = `{{ tag scope="foo" }}
        {{ foo:one }} {{ foo:two }}
        {{ /tag }}`;
        const output = `{{ tag scope="foo" }}
    {{ foo:one }} {{ foo:two }}
{{ /tag }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('additional ifs with nested interpolations', () => {
        const template = `
{{ if 'test-wilderness' == 'test-{associative[default_key]}' }}yes{{ else }}nope{{ /if }}
{{ if 'test-{'wilderness'}'	 == 		'test-{associative[default_key]}' }}yes{{ else }}nope{{ /if }}
{{ if 'test-wilderness' == 'test-not-{associative[default_key]}' }}yes{{ else }}nope{{ /if }}
{{ if {truthy} }}yes{{ else }}no{{ /if }}
`;
        const output = `{{ if 'test-wilderness' == 'test-{associative[default_key]}' }}yes{{ else }}nope{{ /if }}
{{ if 'test-{'wilderness'}' == 'test-{associative[default_key]}' }}yes{{ else }}nope{{ /if }}
{{ if 'test-wilderness' == 'test-not-{associative[default_key]}' }}yes{{ else }}nope{{ /if }}
{{ if {truthy} }}yes{{ else }}no{{ /if }}`;
        assert.strictEqual(format(template), output);
    });

    test('it does not remove whitespace inside string interpolations', () => {
        const template = `{{ test variable='{ true ? 'Hello wilderness - {{default_key}}' : 'fail' }' }}`;
        const output = `{{ test variable='{ true ? 'Hello wilderness - {{default_key}}' : 'fail'}' }}`;
        assert.strictEqual(format(template), output);
    });

    test('it emits variable fallback operator', () => {
        assert.strictEqual(format(`{{ test 
            ?= 			'test' }}				 
        `), "{{ test ?= 'test' }}");
    });

    test('it emits logical and keyword', () => {
        assert.strictEqual(format('{{ left   and     right }}'), '{{ left and right }}');
    });

    test('it emits symbolic and full', () => {
        assert.strictEqual(format('{{ left   &&     right }}'), '{{ left && right }}');
    });

    test('it emits symbolic and short', () => {
        assert.strictEqual(format('{{ left   &     right }}'), '{{ left & right }}');
    });

    test('it emits logical or keyword', () => {
        assert.strictEqual(format('{{ left   or     right }}'), '{{ left or right }}');
    });

    test('it emits symbolic or', () => {
        assert.strictEqual(format('{{ left   ||     right }}'), '{{ left || right }}');
    });

    test('it emits logical xor keyword', () => {
        assert.strictEqual(format('{{ left   xor     right }}'), '{{ left xor right }}');
    });

    test('it emits ==', () => {
        assert.strictEqual(format('{{ left   ==     right }}'), '{{ left == right }}');
    });

    test('it emits !=', () => {
        assert.strictEqual(format('{{ left   !=     right }}'), '{{ left != right }}');
    });

    test('it emits ??', () => {
        assert.strictEqual(format('{{ left   ??     right }}'), '{{ left ?? right }}');
    });

    test('it emits ?:', () => {
        assert.strictEqual(format('{{ left   ?:     right }}'), '{{ left ?: right }}');
    });

    test('it emits ?', () => {
        assert.strictEqual(format('{{ left   ?     right }}'), '{{ left ? right }}');
    });

    test('it emits <=>', () => {
        assert.strictEqual(format('{{ left   <=>     right }}'), '{{ left <=> right }}');
    });

    test('it emits <', () => {
        assert.strictEqual(format('{{ left   <     right }}'), '{{ left < right }}');
    });

    test('it emits <=', () => {
        assert.strictEqual(format('{{ left   <=     right }}'), '{{ left <= right }}');
    });

    test('it emits >', () => {
        assert.strictEqual(format('{{ left   >     right }}'), '{{ left > right }}');
    });

    test('it emits >=', () => {
        assert.strictEqual(format('{{ left   >=     right }}'), '{{ left >= right }}');
    });

    test('it emits null', () => {
        assert.strictEqual(format('{{ test =    null; }}'), '{{ test = null; }}');
    });

    test('it emits true', () => {
        assert.strictEqual(format('{{ test =    true; }}'), '{{ test = true; }}');
    });

    test('it emits false', () => {
        assert.strictEqual(format('{{ test =    false; }}'), '{{ test = false; }}');
    });

    test('it emits not keyword', () => {
        assert.strictEqual(format('{{ 		left not     right; }}'), '{{ left not right; }}');
    });

    test('it emits array keyword', () => {
        assert.strictEqual(format(`{{ test =    arr(
            'one' => 1,
            'two' => 2	
        ) }}`), `{{ test = arr('one' => 1, 'two' => 2) }}`);
    });

    test('it emits array brackets', () => {
        assert.strictEqual(format(`{{ test =    [
            'one' => 1,
            'two' => 2	
        ] }}`), `{{ test = ['one' => 1, 'two' => 2] }}`);
    });

    test('it emits strings', () => {
        assert.strictEqual(format(`{{ test = 'Escape \\'' }}`), `{{ test = 'Escape \\'' }}`);
        assert.strictEqual(format(`{{ test = 'Escape \\'Test\\\\' }}`), `{{ test = 'Escape \\'Test\\\\' }}`);
    });

    test('it emits numbers', () => {
        assert.strictEqual(format(`{{ test = -132 }}`), `{{ test = -132 }}`);
        assert.strictEqual(format(`{{ test = 132.01 }}`), `{{ test = 132.01 }}`);
    });

    test('it emits bindings', () => {
        assert.strictEqual(format('{{ test :variable="name|upper" }}'), '{{ test :variable="name|upper" }}');
    });

    test('it emits language operators', () => {
        assert.strictEqual(format('{{ left pluck       right }}'), '{{ left pluck right }}');
        assert.strictEqual(format('{{ left take       right }}'), '{{ left take right }}');
        assert.strictEqual(format('{{ left skip       right }}'), '{{ left skip right }}');
        assert.strictEqual(format('{{ left orderby       right }}'), '{{ left orderby right }}');
        assert.strictEqual(format('{{ left groupby       right }}'), '{{ left groupby right }}');
        assert.strictEqual(format('{{ left merge       right }}'), '{{ left merge right }}');
        assert.strictEqual(format('{{ left where       right }}'), '{{ left where right }}');
    });

    test('it indents conditionals', () => {
        const input = `<p>Outer Start</p>
{{ articles }}
<p>start</p>
{{ if title == 'Nectar of the Gods' }}
<p>Inner literal one.</p>
{{ elseif 5 < 10 }}
<p>Inner literal two.</p>
{{ else }}
<p>Else- inner literal three..</p>
{{ /if }}
<p>end</p>
{{ /articles }}
<p>Outer end</p>`;
        const expected = `<p>Outer Start</p>
{{ articles }}
    <p>start</p>
    {{ if title == 'Nectar of the Gods' }}
        <p>Inner literal one.</p>
    
    {{ elseif 5 < 10 }}
        <p>Inner literal two.</p>
    
    {{ else }}
        <p>Else- inner literal three..</p>
    {{ /if }}
    <p>end</p>
{{ /articles }}
<p>Outer end</p>`;
        assert.strictEqual(format(input), expected);
    });

    test('it indents nested conditionals', () => {
        const input = `<p>Outer Start</p>
{{ articles }}
<p>start</p>
{{ if title == 'Nectar of the Gods' }}
<p>Inner literal one.</p>

{{ if true == true }}
{{ if true == false }}
{{ elseif false == true }}
{{ if abc == 'abc' }}

{{ /if }}
{{ /if }}
{{ else }}

{{ /if }}

{{ elseif 5 < 10 }}
<p>Inner literal two.</p>
{{ else }}
<p>Else- inner literal three..</p>
{{ /if }}
<p>end</p>
{{ /articles }}
<p>Outer end</p>`;
        const expected = `<p>Outer Start</p>
{{ articles }}
    <p>start</p>
    {{ if title == 'Nectar of the Gods' }}
        <p>Inner literal one.</p>

        {{ if true == true }}
            {{ if true == false }}
            {{ elseif false == true }}
                {{ if abc == 'abc' }}
                    
                {{ /if }}
            {{ /if }}
        
        {{ else }}
            
        {{ /if }}
    
    {{ elseif 5 < 10 }}
        <p>Inner literal two.</p>
    
    {{ else }}
        <p>Else- inner literal three..</p>
    {{ /if }}
    <p>end</p>
{{ /articles }}
<p>Outer end</p>`;
        assert.strictEqual(format(input), expected);
    });

    test('switch groups do not have crazy spacing', () => {
        const input = `<div class="container w-full py-32 space-y-24">
{{ entries = {collection:possibilities sort="order"} }}
{{ test }}
{{ one }}
{{ two }}
{{ three }}
{{ four }}
{{ five }}
{{ six }}
{{ parity = switch(
((index | mod:2) == 0) => 'even',
((index | mod:2) == 1) => 'odd',
) }}
{{ /six }}
{{ /five }}
{{ /four }}
{{ /three }}
{{ /two }}
{{ /one }}
{{ /test }}
{{ partial:possibilities/preview :side="parity" }}
{{ /entries }}
</div>`;
        const expected = `<div class="container w-full py-32 space-y-24">
    {{ entries = {collection:possibilities sort="order"} }}
        {{ test }}
            {{ one }}
                {{ two }}
                    {{ three }}
                        {{ four }}
                            {{ five }}
                                {{ six }}
                                    {{ parity = switch(
                                                   ((index | mod:2) == 0) => 'even',
                                                   ((index | mod:2) == 1) => 'odd',
                                                   ) }}
                                {{ /six }}
                            {{ /five }}
                        {{ /four }}
                    {{ /three }}
                {{ /two }}
            {{ /one }}
        {{ /test }}
        {{ partial:possibilities/preview :side="parity" }}
    {{ /entries }}
</div>`;
        assert.strictEqual(formatDefaultHtmlSettings(input), expected);
    });

    test('it emits switch groups', () => {
        const input = `{{ test variable="{switch(
(size == 'sm') => '(min-width: 768px) 35vw, 90vw',
(size == 'md') => '(min-width: 768px) 55vw, 90vw',
(size == 'lg') => '(min-width: 768px) 75vw, 90vw',
(size == 'xl') => '90vw'
)}" }}`;
        const expected = `{{ test variable="{switch(
    (size == 'sm') => '(min-width: 768px) 35vw, 90vw',
    (size == 'md') => '(min-width: 768px) 55vw, 90vw',
    (size == 'lg') => '(min-width: 768px) 75vw, 90vw',
    (size == 'xl') => '90vw')}" }}`;

        assert.strictEqual(format(input), expected);
    });

    test('it emits list groups', () => {
        const input = `{{

    items = list(
        name,  
        
                color,
                
                
                type;
        'Apple',
                 'red', 		'fruit';
'Hammer', 'brown', 'tool';
                'Orange', 'orange', 
                        'fruit';
        'Lettuce',
'green', 'vegetable';
    )
    }}<p>Inner</p>
    {{

        items = list(
            name,    color, type;
            'Apple', 'red', 'fruit';
            'Hammer', 'brown', 'tool';
            'Orange', 'orange', 'fruit';
            'Lettuce', 'green', 'vegetable'
        )
    }}`;
        const expected = `{{ items = list(name, color, type;
                'Apple', 'red', 'fruit';
                'Hammer', 'brown', 'tool';
                'Orange', 'orange', 'fruit';
                'Lettuce', 'green', 'vegetable';
             ) }}<p>Inner</p>
{{ items = list(name, color, type;
                'Apple', 'red', 'fruit';
                'Hammer', 'brown', 'tool';
                'Orange', 'orange', 'fruit';
                'Lettuce', 'green', 'vegetable') }}`;
        assert.strictEqual(format(input), expected);
    });

    test('it emits unless pairs', () => {
        const template = `
        Leading Literal
        {{ unless true}}
        <div>A</div>
        {{ elseunless
                 false    }}
        <div>B</div>
        {{ else }}
        <div>C</div>
        {{ /unless }}`;
        const expected = `Leading Literal
{{ unless true }}
    <div>A</div>

{{ elseunless false }}
    <div>B</div>

{{ else }}
    <div>C</div>
{{ /unless }}`;
        assert.strictEqual(format(template), expected);
    });

    test('it exits early on unpaired unless structures', () => {
        const template = `---
hello: wilderness
---

{{ unless 		true}}Inner`;
        assert.strictEqual(format(template), template);
    });

    test('it exits early on unpaired if structures', () => {
        const template = `---
hello: wilderness
---
A
{{ if 		true}}Inner

B`;
        assert.strictEqual(format(template), template);
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
        assert.strictEqual(format(input), output);
    });

    test('it can format reasonable fragmented documents', () => {
        const template = `Before Yield
        {{ yield:tester }}
        After Yield
        
        <ul>
        {{ arrdata }}
        Before Partial
        {{ partial:nested }}
        {{ slot:test }}NameStart{{ value }}NameEnd{{ /slot:test }}
        
        Normal Slot Content ({{ value }})
        {{ /partial:nested }}
        After Partial
        {{ /arrdata }}`;
        const output = `Before Yield
{{ yield:tester }}
After Yield

<ul>
    {{ arrdata }}
        Before Partial
        {{ partial:nested }}
            {{ slot:test }}
                NameStart{{ value }}NameEnd
            {{ /slot:test }}

            Normal Slot Content ({{ value }})
        {{ /partial:nested }}
        After Partial
    {{ /arrdata }}`;
        assert.strictEqual(format(template), output);
    });

    test('it will pull wrapped closing tags to the next line', () => {
        const template = `Before Yield
{{ yield:tester }}
After Yield

<ul>
{{ arrdata }}
Before Partial
{{ partial:nested }}
{{ slot:test }}NameStart{{ value }}NameEnd{{ /slot:test }}

Normal Slot Content ({{ value }})
{{ /partial:nested }}
After Partial
{{ /arrdata }}</ul>`;
        const output = `Before Yield
{{ yield:tester }}
After Yield

<ul>
    {{ arrdata }}
        Before Partial
        {{ partial:nested }}
            {{ slot:test }}
                NameStart{{ value }}NameEnd
            {{ /slot:test }}

            Normal Slot Content ({{ value }})
        {{ /partial:nested }}
        After Partial
    {{ /arrdata }}
</ul>`;
        assert.strictEqual(format(template), output);
    });

    test('it indents code but not literal text', () => {
        const template = `Before Yield.
        {{ yield:dark_mode }}
        After Yield.
        
        {{ section:dark_mode }}
        <span>Some content.</span>
        {{ /section:dark_mode }}`;
        const output = `Before Yield.
{{ yield:dark_mode }}
After Yield.

{{ section:dark_mode }}
    <span>Some content.</span>
{{ /section:dark_mode }}`;
        assert.strictEqual(format(template), output);
    });

    test('it keeps conditions on one line if they started that way', () => {
        assert.strictEqual(
            format(`{{		 if 'test-{'wilderness'}' == 'test-{associative[default_key]}' }}yes{{ else }}nope{{ /if }}`),
            `{{ if 'test-{'wilderness'}' == 'test-{associative[default_key]}' }}yes{{ else }}nope{{ /if }}`
        );
    });

    test('it emits nested interpolations', () => {
        assert.strictEqual(
            format(`{{ 
    
    
                test variable='{ true		 ? 'Hello wilderness - {{default_key}}' 
                : 'fail' }' }}`),
            `{{ test variable='{ true ? 'Hello wilderness - {{default_key}}' : 'fail'}' }}`
        );
    });

    


    test('formatter can be disabled', () => {
        const input = `{{#
            @name Form
            @desc The form page builder block.
            @set page.page_builder.form
            @format false
            #}}
            
            <!-- /page_builder/_form.antlers.html -->
            <section class="fluid-container grid md:grid-cols-12 gap-8">
            <div class="md:col-start-3 md:col-span-8">
            {{ partial:typography/h1 as="h2" color="text-primary" class="mb-8" :content="block:title" }}
            {{ partial:typography/paragraph :content="block:text" }}
            
            {{# Create the selected form and reference Alpine data in \`sending()\`. Prevent form from submitting with POST as we will submit with AJAX. #}}
            {{ form:create in="{            form:handle
            
            
            
            
            }" id="form-{form:handle
            }" class="flex flex-wrap" 
            
                                x-ref="form" x-data="sending" 
                                
                                @submit.prevent="sendForm()" }}
            <div class="w-full grid md:grid-cols-12 gap-6">
            {{# Honeypot spam protection. #}}
            <div class="hidden">
            <label class="font-bold" for="{{ honeypot
            
            
            }}">{{ trans:strings.form_honeypot }} <sup class="text-yellow-400">*</sup></label>
            <input class="form-input w-full" id="{{                         honeypot }}" type="text" name="{{ honeypot }}" tabindex="-1" autocomplete="off" />
            </div>
            
            {{# Render default-styled fields in a separate partial so it's easy to make different form styles, for example: {{ if form:handle == 'another_form'. }} #}}
            {{ partial:snippets/form_fields }}
            
            </div>
            {{ /form:create }}
            
            {{# The form script handling validation and submission via AJAX with \`fetch()\`. #}}
            <script>
            document.addEventListener('alpine:initializing', () => {
            Alpine.data('sending', () => {
            return {
            error: false,
                    errors: [],
                    sending: false,
                    success: false,
                    sendForm: async function() {
                    this.sending = true
            
            // Get a token and set it.
            const token = await getToken()
            document.querySelectorAll('form input[name="_token"]').forEach(function(item) {
                item.value = token
            });
            
            // Post the form.
            fetch(this.$refs.form.action, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    method: 'POST',
                    body: new FormData(this.$refs.form)
                })
                .then(res => res.json())
                .then(json => {
                    if (json['success']) {
                        this.errors = []
                        this.success = true
                        this.error = false
                                                                    this.sending = false
                                                                    this.$refs.form.reset()
            
                                                                    setTimeout(function() {
                                                                        this.success = false
                                                                    }, 4500)
                                                                }
                                                                if (json['error']) {
                                                                    this.sending = false
                                                                    this.error = true
                                                                    this.success = false
                                                                    this.errors = json['error']
                                                                }
                                                            })
                                                            .catch(err => {
                                                                err.text().then(errorMessage => {
                                                                    this.sending = false
                                                                })
                })
            }
            }
            })
            })
            </script>
            
            </div>
            </section>
            <!-- End: /page_builder/_form.antlers.html -->`;

        assert.strictEqual(formatDefaultHtmlSettings(input), input);
    });
    
});