import assert = require('assert');
import { formatAntlers } from './testUtils/formatAntlers';

suite('Formatting Peak Samples', () => {
    test('peak sample 1', () => {
        const input = `{{#
            @name Skip to content button
            @desc The first button that pops up when a user tabs. This enables them to skip directly to the content.
            #}}
            
            <!-- /navigation/_skip_to_content.antlers.html -->
            <a class="fixed hidden md:block bottom-safe left-8 py-2 px-4 bg-primary text-white text-sm font-bold translate-y-24 opacity-0 focus-visible:translate-y-0 focus-visible:opacity-100 focus:outline-none focus-visible:ring-2 ring-primary ring-offset-2 motion-safe:transition-all" href="#content">
            {{ trans:strings.skip_to_content }}
            </a>
            <!-- End: /navigation/_skip_to_content.antlers.html -->`;
        const expected = `{{#
    @name Skip to content button
    @desc The first button that pops up when a user tabs. This enables them to skip directly to the content.
#}}

<!-- /navigation/_skip_to_content.antlers.html -->
<a class="fixed hidden md:block bottom-safe left-8 py-2 px-4 bg-primary text-white text-sm font-bold translate-y-24 opacity-0 focus-visible:translate-y-0 focus-visible:opacity-100 focus:outline-none focus-visible:ring-2 ring-primary ring-offset-2 motion-safe:transition-all" href="#content">
    {{ trans:strings.skip_to_content }}
</a>
<!-- End: /navigation/_skip_to_content.antlers.html -->`;
        assert.strictEqual(formatAntlers(input), expected);
    });

    test('peak_sample2', () => {
        const expected = `{{#
    @name Main navigation
    @desc The sites main navigation rendered on each page. There's a desktop and a mobile version.
#}}

{{# The desktop navigation. Hidden on smaller screen. Shown from md and up. #}}
{{ partial:navigation/main_desktop }}
{{# The mobile navigation. Hidden from md and up #}}
{{ partial:navigation/main_mobile }}`;
        const input = `{{#
    @name Main navigation
    @desc The sites main navigation rendered on each page. There's a desktop and a mobile version.
#}}

    {{# The desktop navigation. Hidden on smaller screen. Shown from md and up. #}}
    {{ partial:navigation/main_desktop }}

            {{# The mobile navigation. Hidden from md and up #}}
            {{ partial:navigation/main_mobile }}`;

        assert.strictEqual(formatAntlers(input), expected);
    });

    test('peak_sample3', () => {
        const expected = `{{#
    @name Layout
    @desc The default layout file.
#}}

<!-- /layout.antlers.html -->
<!doctype html>
<html lang="{{ site:short_locale }}">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <link rel="stylesheet" href="{{ mix src="css/site.css" }}">
    <script src="{{ mix src="/js/site.js" }}" defer></script>

    {{# Replace the following line with the SEO Pro or Aardvark SEO tag if you want to use an addon for SEO. Also remove the seo section in you page blueprint. #}}
    {{ partial:snippets/seo }}
    {{ partial:snippets/browser_appearance }}
</head>

<body class="flex flex-col min-h-screen bg-white selection:bg-primary selection:text-white">
    {{ partial:snippets/noscript }}
    {{ partial:navigation/skip_to_content }}
    {{ partial:components/toolbar }}
    {{# Remove the following line if you want to use an addon for SEO. #}}
    {{ yield:seo_body }}
    {{ partial:layout/header }}
    {{ template_content }}
    {{ partial:layout/footer }}
</body>

</html>
<!-- End: /layout.antlers.html -->`;
        const input = `{{#
    @name Layout
    @desc The default layout file.
#}}

<!-- /layout.antlers.html -->
<!doctype html>
<html lang="{{ site:short_locale }}">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <link rel="stylesheet" href="{{                                 mix src="css/site.css" 

}}">
    <script src="{{ mix src="/js/site.js" }}" defer></script>

    {{# Replace the following line with the SEO Pro or Aardvark SEO tag if you want to use an addon for SEO. Also remove the seo section in you page blueprint. #}}
    {{ partial:snippets/seo }}

    {{ partial:snippets/browser_appearance 
    
    
    }}
</head>

<body class="flex flex-col min-h-screen bg-white selection:bg-primary selection:text-white">
            {{ partial:snippets/noscript }}
            {{  partial:navigation/skip_to_content }}
            {{           partial:components/toolbar }}

            {{# Remove the following line if you want to use an addon for SEO. #}}
            {{ yield:seo_body }}

            {{ partial:layout/header }}
            {{ template_content }}
            {{ partial:layout/footer }}
        </body>

</html>
<!-- End: /layout.antlers.html -->`;
        assert.strictEqual(formatAntlers(input), expected);
    });

    test('peak_sample4', () => {
        const expected = `{{#
    @name Form
    @desc The form page builder block.
    @set page.page_builder.form
#}}

<!-- /page_builder/_form.antlers.html -->
<section class="fluid-container grid md:grid-cols-12 gap-8">
    <div class="md:col-start-3 md:col-span-8">
        {{ partial:typography/h1 as="h2" color="text-primary" class="mb-8" :content="block:title" }}
        {{ partial:typography/paragraph :content="block:text" }}
        {{# Create the selected form and reference Alpine data in \`sending()\`. Prevent form from submitting with POST as we will submit with AJAX. #}}
        {{ form:create in="{form:handle}" id="form-{form:handle}" class="flex flex-wrap" x-ref="form" x-data="sending" @submit.prevent="sendForm()" }}
            <div class="w-full grid md:grid-cols-12 gap-6">
                {{# Honeypot spam protection. #}}
                <div class="hidden">
                    <label class="font-bold" for="{{ honeypot }}">{{ trans:strings.form_honeypot }} <sup class="text-yellow-400">*</sup></label>
                    <input class="form-input w-full" id="{{ honeypot }}" type="text" name="{{ honeypot }}" tabindex="-1" autocomplete="off" />
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
        const input = `{{#
    @name Form
    @desc The form page builder block.
    @set page.page_builder.form
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

        assert.strictEqual(formatAntlers(input), expected);
    });
    
    test('peak_sample5', () => {
        const expected = `{{#
    @name Collection
    @desc The collection page builder block.
    @set page.page_builder.collection
#}}

<!-- /page_builder/_collection.antlers.html -->
<section class="fluid-container grid md:grid-cols-12 gap-8">
    <div class="md:col-start-3 md:col-span-8">
        {{ partial:typography/h2 class="mb-4" :content="block:title" }}
        <ul class="list-inside list-disc">
            {{ block:collection }}
                <li>
                    <a class="p-1 -m-1 text-primary underline focus:outline-none focus-visible:ring-2 ring-primary" href="{{ url }}">
                        {{ title }}
                    </a>
                </li>
            {{ /block:collection }}
        </ul>
    </div>
</section>
<!-- End: /page_builder/_collection.antlers.html -->`;
        const input = `{{#
@name Collection
@desc The collection page builder block.
@set page.page_builder.collection
#}}

<!-- /page_builder/_collection.antlers.html -->
<section class="fluid-container grid md:grid-cols-12 gap-8">
<div class="md:col-start-3 md:col-span-8">
{{ 
    partial:typography/h2 class="mb-4" :content="block:title" 
}}
<ul class="list-inside list-disc">
{{ 
    block:collection 
}}
<li>
<a class="p-1 -m-1 text-primary underline focus:outline-none focus-visible:ring-2 ring-primary" href="{{
                                     url }}">
{{ 
    title
 }}
</a>
</li>
{{ /block:collection }}
</ul>
</div>
</section>
<!-- End: /page_builder/_collection.antlers.html -->`;

        assert.strictEqual(formatAntlers(input), expected);
    });

    test('peak_sample6', () => {
        const expected = `{{#
    @name Caption
    @desc The typography caption partial to render an h1 caption \`as\`, \`caption\` attributes.
#}}

<!-- /typography/_caption.antlers.html -->
{{ if caption }}
    <{{ as or 'span' }} class="mt-2 text-neutral text-sm">
        {{ caption }}
    </{{ as or 'span' }}>
{{ /if }}
<!-- End: /typography/_caption.antlers.html -->`;
        const input = `{{#
    @name Caption
    @desc The typography caption partial to render an h1 caption \`as\`, \`caption\` attributes.
    #}}
    
    <!-- /typography/_caption.antlers.html -->
    {{ if caption }}
        <{{ as or 'span' }} class="mt-2 text-neutral text-sm">
                                    {{ caption }}
                                </{{ as or 'span' }}>
    {{ /if }}
    <!-- End: /typography/_caption.antlers.html -->`;

        assert.strictEqual(formatAntlers(input), expected);
    });

    test('peak_sample7', () => {
        const expected = `{{#
    @name h3
    @desc The typography h3 partial to render an h3 with \`class\`, \`as\`, \`color\` and \`content\` attributes.
#}}

<{{ as or 'h3' }} class="text-base font-bold leading-tight {{ color or 'text-black' }} {{ class }}">
    <div>{{ content | nl2br }}</div>
</{{ as or 'h3' }}>`;
        const input = `{{#
@name h3
@desc The typography h3 partial to render an h3 with \`class\`, \`as\`, \`color\` and \`content\` attributes.
#}}

        <{{ as or 'h3' }} class="text-base font-bold leading-tight {{ color or 'text-black' }} {{ class }}"><div>{{ content | nl2br }}</div></{{ as or 'h3' }}>`;

        assert.strictEqual(formatAntlers(input), expected);
    });
});