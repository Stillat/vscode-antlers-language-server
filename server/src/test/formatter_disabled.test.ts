import assert from 'assert';
import { formatAntlers } from './testUtils/formatAntlers.js';

suite('Formatter Disabled', () => {
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

        assert.strictEqual(formatAntlers(input), input);
    });

    test('formatting can be disabled for specific regions', () => {
        const input = `
<div><div><div>
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
        const expected = `<div>
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
        assert.strictEqual(formatAntlers(input).trim(), expected);
    });

    test('it preserves paired content when ignoring regions', () => {
        const input = `{{# format-ignore-start #}}
    <title>{{ yield:document_title_section }}{{ document_title ?? title + ' / ' + config:app:name }}{{ /yield:document_title_section }}</title>
    {{# format-ignore-end #}}`;
        const expected = `{{# format-ignore-start #}}
    <title>{{ yield:document_title_section }}{{ document_title ?? title + ' / ' + config:app:name }}{{ /yield:document_title_section }}</title>
{{# format-ignore-end #}}`;
        assert.strictEqual(formatAntlers(input), expected);
    })
});