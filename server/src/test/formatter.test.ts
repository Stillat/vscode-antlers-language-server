import assert = require('assert');
import { AntlersFormatter, AntlersFormattingOptions } from '../formatting/antlersFormatter';
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
    maxStatementsPerLine: 3
};

const antlersOptionsDefault: AntlersFormattingOptions = {
    htmlOptions: {},
    tabSize: 4,
    insertSpaces: true,
    formatFrontMatter: true,
    maxStatementsPerLine: 3
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

    test('peak_sample1', () => {
        const expected = `{{#
    @name Skip to content button
    @desc The first button that pops up when a user tabs. This enables them to skip directly to the content.
#}}

<!-- /navigation/_skip_to_content.antlers.html -->
<a class="fixed hidden md:block bottom-safe left-8 py-2 px-4 bg-primary text-white text-sm font-bold translate-y-24 opacity-0 focus-visible:translate-y-0 focus-visible:opacity-100 focus:outline-none focus-visible:ring-2 ring-primary ring-offset-2 motion-safe:transition-all" href="#content">
    {{ trans:strings.skip_to_content }}
</a>
<!-- End: /navigation/_skip_to_content.antlers.html -->`;
        const input = `{{#
@name Skip to content button
@desc The first button that pops up when a user tabs. This enables them to skip directly to the content.
#}}

<!-- /navigation/_skip_to_content.antlers.html -->
<a class="fixed hidden md:block bottom-safe left-8 py-2 px-4 bg-primary text-white text-sm font-bold translate-y-24 opacity-0 focus-visible:translate-y-0 focus-visible:opacity-100 focus:outline-none focus-visible:ring-2 ring-primary ring-offset-2 motion-safe:transition-all" href="#content">
{{ trans:strings.skip_to_content }}
</a>
<!-- End: /navigation/_skip_to_content.antlers.html -->`;

        assert.strictEqual(format(input), expected);
    });

    test('it wraps multiple language operators', () => {
        const template = `
        {{ test = one merge two 
                        where (name == 'name' && type == 'test')
                                     take (1) skip(		5) orderby(name 'desc')
                                     
                            groupby(test) as	 'groupName' groupby(title'name') as 'another')  }}`;
        const output = `{{ test = one merge two
            where (name == 'name' && type == 'test')
            take (1)
            skip (5)
            orderby (name 'desc')
            groupby (test) as 'groupName'
            groupby (title 'name') as 'another') }}`;

        assert.strictEqual(format(template), output);
    });

    test('it does not double up', () => {
        const initial = `{{# Page title #}}
        <title>
            {{ yield:seo_title }}
            {{ seo_title ? seo_title : title }}
            {{ seo:title_separator ? seo:title_separator : " &#124; " }}
            {{ seo:change_page_title where="collection:{collection}" }}
                {{ if what_to_add == 'collection_title' }}
                    {{ collection:title }}
                {{ elseif what_to_add == 'custom_text' }}
                    {{ custom_text }}
                {{ /if }}
                {{ seo:title_separator ? seo:title_separator : " &#124; " }}
            {{ /seo:change_page_title }}
            {{ seo:site_name ? seo:site_name : config:app:name }}
        </title>
        
        {{# Page description #}}
        {{ if seo_description }}
              <meta name="description" content="{{ seo_description }}">
        {{ elseif seo:collection_defaults }}
              <meta name="description" content="{{ partial:snippets/fallback_description }}">
        {{ /if }}
        
        
        {{# Some other comments #}}
        {{ if seo_description }}
            <meta name="description" content="{{ seo_description }}">
        {{ elseif seo:collection_defaults }}
            <meta name="description" content="{{ partial:snippets/fallback_description }}">
        {{ /if }}`;
        const output = `{{# Page title #}}
<title>
    {{ yield:seo_title }}
    {{ seo_title ? seo_title : title }}
    {{ seo:title_separator ? seo:title_separator : " &#124; " }}
    {{ seo:change_page_title where="collection:{collection}" }}
        {{ if what_to_add == 'collection_title' }}
            {{ collection:title }}
        {{ elseif what_to_add == 'custom_text' }}
            {{ custom_text }}
         {{ /if }}
        {{ seo:title_separator ? seo:title_separator : " &#124; " }}
    {{ /seo:change_page_title }}
    {{ seo:site_name ? seo:site_name : config:app:name }}
</title>

{{# Page description #}}
{{ if seo_description }}
    <meta name="description" content="{{ seo_description }}">

{{ elseif seo:collection_defaults }}
    <meta name="description" content="{{ partial:snippets/fallback_description }}">
{{ /if }}


{{# Some other comments #}}
{{ if seo_description }}
    <meta name="description" content="{{ seo_description }}">

{{ elseif seo:collection_defaults }}
    <meta name="description" content="{{ partial:snippets/fallback_description }}">
{{ /if }}`;
        assert.strictEqual(format(initial), output);
        for (let i = 0; i <= 10; i++) {
            assert.strictEqual(format(output), output);
        }
    });

    test('it does not do weird things with many chained strings and numeric values', () => {
        const template = `<html>
<head>
</head>
<body>
<style>
:root {
    --primary-color: {{ thxme:primary_color ?? "#FA\\"7268" 
    ?? 23.0 }};
    --secondary-color: {{ thxmed:secondary_color ?? "#C62368" ?? 320.0 ?? "#C62fff368" ?? "#C62368aaa" ?? "#C6236bbb8" ?? null }};
    --plyr-color-main: {{ thxmedddd:primary_color ?? "#C62368" }};
}

{{ 			if what_to_add		 == 			'#collection_title' }} {{ /if }}
</style>
<script>
window.primaryColor = '{{ thxmeddddd:primary_color ?? "#FA7268" }}';
window.secondaryColor = '{{ theme:secondary_color ?? "#C62368" }}';
</script>
</body>
</html>`;
        const output = `<html>
<head>
</head>
<body>
    <style>
        :root {
            --primary-color: {{ thxme:primary_color ?? "#FA\\"7268" ?? 23.0 }};
            --secondary-color: {{ thxmed:secondary_color ?? "#C62368" ?? 320.0 ?? "#C62fff368" ?? "#C62368aaa" ?? "#C6236bbb8" ?? null }};
            --plyr-color-main: {{ thxmedddd:primary_color ?? "#C62368" }};
        }

        {{ if what_to_add == '#collection_title' }}{{ /if }}
    </style>
    <script>
        window.primaryColor = '{{ thxmeddddd:primary_color ?? "#FA7268" }}';
        window.secondaryColor = '{{ theme:secondary_color ?? "#C62368" }}';
    </script>
</body>
</html>`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('it does not continue to indent comments', () => {
        const initial = `<div>
        {{#  comment 1 #}}
        {{# comment 2 #}}
        {{ variable }}
        </div>`;
        const output = `<div>
    {{# comment 1 #}}
    {{# comment 2 #}}
    {{ variable }}
</div>`;
        assert.strictEqual(format(initial), output);
        for (let i = 0; i <= 10; i++) {
            assert.strictEqual(format(output), output);
        }
    });

    test('it does not remove unless else', () => {
        const output = `<body class="flex flex-col min-h-screen bg-white selection:bg-primary selection:text-white {{ unless segment_1 }}home-{{else}}page-{{ /unless }}content">`;
        assert.strictEqual(
            format(`<body class="flex flex-col min-h-screen bg-white selection:bg-primary selection:text-white {{ unless segment_1 }}home-{{else}}page-{{ /unless }}content">`),
            output
        );
    });

    test('it indents nested pairs nicely', () => {
        const expected = `{{ fields }}
    {{ if something }}
        <div>
            <label></label>
        </div>
     {{ /if }}
{{ /fields }}`;

        assert.strictEqual(format(`{{ fields }}
        {{ if something }}
        <div>
        <label></label>
    </div>
        {{ /if}}
    {{ /fields }}`), expected);
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

        assert.strictEqual(format(input), expected);
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
        assert.strictEqual(format(input), expected);
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

        assert.strictEqual(format(input), expected);
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

        assert.strictEqual(format(input), expected);
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

        assert.strictEqual(format(input), expected);
    });

    test('peak_sample7', () => {
        const expected = `{{#
    @name h3
    @desc The typography h3 partial to render an h3 with \`class\`, \`as\`, \`color\` and \`content\` attributes.
#}}

<{{ as or 'h3' }} class="text-base font-bold leading-tight {{ color or 'text-black' }} {{ class }}">{{ content | nl2br }}</{{ as or 'h3' }}>`;
        const input = `{{#
@name h3
@desc The typography h3 partial to render an h3 with \`class\`, \`as\`, \`color\` and \`content\` attributes.
#}}

        <{{ as or 'h3' }} class="text-base font-bold leading-tight {{ color or 'text-black' }} {{ class }}">{{ content | nl2br }}</{{ as or 'h3' }}>`;

        assert.strictEqual(format(input), expected);
    });
    test('it wraps on automatic statement separators', () => {
        assert.strictEqual(format(`{{ test = 1 + 
            3 test += 3                  confusing += (							1 + 3 -
                             2 / (3 % 2)) third = 3232 + 342 tail = 		(3 + 2) }}`),
            `{{ test = 1 + 3
   test += 3
   confusing += (1 + 3 - 2 / (3 % 2))
   third = 3232 + 342
   tail = (3 + 2) }}`
        );
    });

    test('it aligns modifiers', () => {
        assert.strictEqual(format(`{{ now   |   timezone   |   format:         r  }}`), '{{ now | timezone | format:r }}');
    });

    test('it preserves simple method chains', () => {
        assert.strictEqual(format('<div>{{ hello:there():chained() }}</div>'),
            `<div>{{ hello:there():chained() }}</div>`);
    });

    test('it emits the php nodes', () => {
        const template = `{{$ $test = 10; $}}abvc {{? $hello = 10; ?}}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), `{{$ $test = 10; $}}abvc {{? $hello = 10; ?}}`);
    });

    test('it emits all parameters', () => {
        const template = `{{           collection:count                 from="something"  from2="something2"

        from3="something3"
    }}`;
        const output = `{{ collection:count from="something" from2="something2" from3="something3" }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('it preserves at params', () => {
        assert.strictEqual(format(`{{				 form:create in="{ form:handle }"
        id="form-{form:handle}"
        
        
        class="flex flex-wrap"
        x-ref="form"
        x-data="sending"
        
        @submit.prevent="sendForm()" }}`), '{{ form:create in="{form:handle}" id="form-{form:handle}" class="flex flex-wrap" x-ref="form" x-data="sending" @submit.prevent="sendForm()" }}');
    });

    test('it indents code', () => {
        const expected = `{{#
    @name Article
    @desc The article page builder block.
    @set page.page_builder.article
#}}

<!-- /page_builder/_article.antlers.html -->
<article class="fluid-container grid grid-cols-12 gap-y-4">
    {{ article }}
        {{ partial src="components/{type}" }}
    {{ /article }}
</article>
<!-- End: /page_builder/_article.antlers.html -->`;

        assert.strictEqual(format(`{{#
            @name Article
                @desc The article page builder block.
                        @set page.page_builder.article
            #}}
            
            <!-- /page_builder/_article.antlers.html -->
 <article class="fluid-container grid grid-cols-12 gap-y-4">
            {{ article }}
                     {{ partial src="components/{type}" }}
            {{ /article }}
            </article>
            <!-- End: /page_builder/_article.antlers.html -->`), expected);
    });

    test('it indents code 2', () => {
        const template = `<nav class="flex items-center justify-between flex-wrap py-12 lg:py-24 max-w-5xl mx-auto">
<div class="text-sm">&copy; {{ now format="Y" }} {{ settings:site_name }}
    –Powered by <a href="https://statamic.com?ref=cool-writings" class="hover:text-teal">Statamic</a></div>
<div class="flex items-center">
    {{ settings:social }}
        <a href="{{ url }}" class="ml-4" aria-label="{{ name }}" rel="noopener">
            {{ svg :src="icon" class="h-6 w-6 hover:text-teal" }}
        </a>
    {{ /settings:social }}
</div>
</nav>
`;
        const output = `<nav class="flex items-center justify-between flex-wrap py-12 lg:py-24 max-w-5xl mx-auto">
    <div class="text-sm">&copy; {{ now format="Y" }} {{ settings:site_name }}
        –Powered by <a href="https://statamic.com?ref=cool-writings" class="hover:text-teal">Statamic</a></div>
    <div class="flex items-center">
        {{ settings:social }}
            <a href="{{ url }}" class="ml-4" aria-label="{{ name }}" rel="noopener">
                {{ svg :src="icon" class="h-6 w-6 hover:text-teal" }}
            </a>
        {{ /settings:social }}
    </div>
</nav>`;
        assert.strictEqual(format(template), output);
    });

    test('it indents code 3', () => {
        const template = `{{ collection from="blog" }}
        {{ collection :from="related_collection" }}
          {{ title }}
        {{ /collection }}
        {{ /collection }}
        `;
        const output = `{{ collection from="blog" }}
    {{ collection :from="related_collection" }}
        {{ title }}
    {{ /collection }}
{{ /collection }}`;
        assert.strictEqual(format(template), output);
    });

    test('basic nodes', () => {
        assert.strictEqual(format(`{{ var += ' test!'; var }}`), `{{ var += ' test!'; var }}`);
        assert.strictEqual(format(`{{ meta_title["No Title Set"] ?? title param="Test" }}`), `{{ meta_title["No Title Set"] ?? title param="Test" }}`);
        assert.strictEqual(format('{{# {{ collection:count from="articles" }} #}}'), '{{# {{ collection:count from="articles" }} #}}');
        assert.strictEqual(format('{{ view:test[hello] | upper:test:param:"hello :|" | lower }}'), '{{ view:test[hello] | upper:test:param:"hello :|" | lower }}');
        assert.strictEqual(format('{{ view:test[view:test[nested:data[more:nested[keys]]]]   }}'), '{{ view:test[view:test[nested:data[more:nested[keys]]]] }}');
        assert.strictEqual(format(`{{ (view:test[hello] | upper:test:param:"hello :|" | lower) == (view:title|lower)}}`), `{{ (view:test[hello] | upper:test:param:"hello :|" | lower) == (view:title | lower) }}`);
        assert.strictEqual(format(`{{ size = size ? sizes[size] : sizes["md"]; size }}`), `{{ size = size ? sizes[size] : sizes["md"]; size }}`);
        assert.strictEqual(format(`{{(view:test[hello]|upper:test:param:"hello :|"|lower)==(view:title|lower)}}`), `{{ (view:test[hello] | upper:test:param:"hello :|" | lower) == (view:title | lower) }}`);
        assert.strictEqual(format(`{{		 view:data:test[nested.key[path:path1]]|upper|lower }}`), `{{ view:data:test[nested.key[path:path1]] | upper | lower }}`);
        const output = `{{# A comment #}}
{{# another comment {{ width }} #}}
<div class="max-w-2xl mx-auto mb-32">
    <p>test</p> {{ subtitle }}
</div>`;

        assert.strictEqual(format(`{{# A comment #}}
        {{# another comment {{ width }} #}}
        <div class="max-w-2xl mx-auto mb-32">
        <p>test</p> {{ subtitle }}
        </div>`), output);
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
        assert.strictEqual(format(template), output);
    });

    test('it emits escaped content characters', () => {
        assert.strictEqual(format('{{ "hello{"@@{world@@}"}" }}'), '{{ "hello{"@@{world@@}"}" }}');
    });

    test('it produces reasonable indentation', () => {
        const output = `{{ bard raw="true" }}
    {{ type }}
    {{ attrs | length }}
    {{ if attrs | length > 0 }}{{ attrs:values:type }}{{ /if }}
{{ /bard }}`;
        assert.strictEqual(
            format(`{{ bard raw="true" }}
            {{ type }}
            {{ attrs | length }}
            {{ if attrs | length > 0 }}{{ attrs:values:type }}{{ /if }}
            {{ /bard }}`),
            output
        );
    });

    test('inline ternary', () => {
        assert.strictEqual(format(`{{ response_code == 404 || hide_sidebar ? 'lg:w-3/4 xl:w-4/5' : 'xl:w-3/5' }}`), `{{ response_code == 404 || hide_sidebar ? 'lg:w-3/4 xl:w-4/5' : 'xl:w-3/5' }}`);
    });

    test('modifier equivalency', () => {
        assert.strictEqual(format(`{{ value | subtract:{2 + 3} }}`), `{{ value | subtract:{2 + 3} }}`);
        assert.strictEqual(format(`{{ value | subtract: {value} }}`), `{{ value | subtract:{value} }}`);
        assert.strictEqual(format(`{{ value | subtract: 5 }}`), `{{ value | subtract:5 }}`);
        assert.strictEqual(format(`{{ {value - 5} }}`), `{{ {value - 5} }}`);
    });

    test('add op', () => {
        assert.strictEqual(format('{{ 5 + "5" }}'), '{{ 5 + "5" }}');
    });

    test('it emits method style modifiers', () => {
        assert.strictEqual(format(`<{{ value_one | test_modifier:value_two }} />
        <{{ value_one | test_modifier(value_two) }}/>`), `<{{ value_one | test_modifier:value_two }} />
<{{ value_one | test_modifier(value_two) }} />`);
    });

    test('it respects nested block elements', () => {
        const expected = `{{#
    @name Article
    @desc The article page builder block.
    @set page.page_builder.article
#}}

<!-- /page_builder/_article.antlers.html -->
<article class="fluid-container grid grid-cols-12 gap-y-4">
    {{ article }}
        <div>
            {{ partial src="components/{type}" }}
        </div>
    {{ /article }}
</article>
<!-- End: /page_builder/_article.antlers.html -->`;

        assert.strictEqual(format(`{{#
    @name Article
            @desc The article page builder block.
                    @set page.page_builder.article
            #}}
            
        <!-- /page_builder/_article.antlers.html -->
            <article class="fluid-container grid grid-cols-12 gap-y-4">
            {{ article }}<div>
                    {{                                      partial 
                        
                        src="components/{type}"    }}
        </div>
        {{ /article }}
            </article>
            <!-- End: /page_builder/_article.antlers.html -->`), expected);
    });

    test('it handles mixed automatic and explicit statement separators', () => {
        const template = `{{ test = 1 + 
    3; test += 3;                  confusing += (							1 + 3 -
                     2 / (3 % 2)) third = 3232 + 342; tail = 		(3 + 2) }}				 
`;
        const expected = `{{ test = 1 + 3; test += 3; confusing += (1 + 3 - 2 / (3 % 2))
   third = 3232 + 342;
   tail = (3 + 2) }}`;
        assert.strictEqual(format(template), expected);
    });

    test('it emits endif', () => {
        const template = `{{ if 		true == true }}Inner{{			 endif }}`,
            expected = `{{ if true == true }}Inner{{ endif }}`;
        assert.strictEqual(format(template), expected);
    });

    test('it rewrites incorrect endunless', () => {
        const template = `{{ unless 		true}}Inner{{			 endunless }}`,
            expected = `{{ unless true }}Inner{{ /unless }}`;
        assert.strictEqual(format(template), expected);
    });

    test('it emits endunless', () => {
        const template = `{{ unless 		true}}Inner{{			 /unless }}`,
            expected = `{{ unless true }}Inner{{ /unless }}`;
        assert.strictEqual(format(template), expected);
    });

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

    test('it exits early on unpaired if/elseif structures', () => {
        const template = `---
hello: wilderness
---
A
{{ if 		true}}Inner{{ elseif false }}

B`;
        assert.strictEqual(format(template), template);
    });

    test('it can format front matter', () => {
        const template = `---
hello: 			wilderness
hello2: 			wilderness2
hello3: wilderness3
---
{{#
    @name Header
    @desc The sites header rendered on each page.
#}}

<!-- /layout/_header.antlers.html -->
<header class="w-full py-4">
    <div class="fluid-container flex justify-between items-center">
        {{# Make partials you want to use for the header or use and edit premade examples like the following ones. #}}
        {{ partial:components/logo width="120" }}
        {{ partial:navigation/main }}
    </div>
</header>
<!-- End: /layout/_header.antlers.html -->`;
        const expected = `---
hello: 'wilderness'
hello2: 'wilderness2'
hello3: 'wilderness3'
---

{{#
    @name Header
    @desc The sites header rendered on each page.
#}}

<!-- /layout/_header.antlers.html -->
<header class="w-full py-4">
    <div class="fluid-container flex justify-between items-center">
        {{# Make partials you want to use for the header or use and edit premade examples like the following ones. #}}
        {{ partial:components/logo width="120" }}
        {{ partial:navigation/main }}
    </div>
</header>
<!-- End: /layout/_header.antlers.html -->`;
        assert.strictEqual(format(template), expected);
    });

    test('it respects parameter node value delimiters', () => {
        const input = `{{ partial:components/button as="button" 				label="{ trans:strings.form_send }" 
                                    attribute='x-bind:disabled="sending" x-bind:class="&#123;&#39;opacity-25 cursor-default&#39;: sending&#125;"' }}`;
        const expected = `{{ partial:components/button as="button" label="{trans:strings.form_send}" attribute='x-bind:disabled="sending" x-bind:class="&#123;&#39;opacity-25 cursor-default&#39;: sending&#125;"' }}`;

        assert.strictEqual(format(input), expected);
    });

    test('template test 1', () => {
        const template = `{{ loopvar }}{{ one }}{{ test:some_parsing var="two" }}{{ two }}{{ /test:some_parsing }}{{ /loopvar }}`;
        const output = `{{ loopvar }}
    {{ one }}{{ test:some_parsing var="two" }}
        {{ two }}
    {{ /test:some_parsing }}
{{ /loopvar }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 2', () => {
        const template = `{{ object }}{{ one }} {{ two }}{{ /object }}`;
        const output = `{{ object }}
    {{ one }} {{ two }}
{{ /object }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 3', () => {
        const template = `before
{{ complex }}
    {{ string }}, {{ count or "0" }}, {{ index or "0" }}, {{ total_results }}
    {{ if first }}first{{ elseif last }}last{{ else }}neither{{ /if }}


{{ /complex }}
after`;
        const output = `before
{{ complex }}
    {{ string }}, {{ count or "0" }},
    {{ index or "0" }}, {{ total_results }}
    {{ if first }}first    {{ elseif last }}last    {{ else }}neither{{ /if }}
{{ /complex }}
after`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 4', () => {
        const template = `{{ if complex_string }}{{ complex_string }}{{ /if }}{{ complex }}{{ /complex }}`;
        const output = `{{ if complex_string }}{{ complex_string }}{{ /if }}
{{ complex }}

{{ /complex }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 5', () => {
        const template = `{{             string          ?       "Pass" : "Fail" }}`;
        const output = `{{ string ? "Pass" : "Fail" }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 6', () => {
        const template = `{{ associative[default_key] | upper | lower }}`;
        const output = `{{ associative[default_key] | upper | lower }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 7', () => {
        const template = `{{ associative[default_key] upper='true' }}`;
        const output = `{{ associative[default_key] upper='true' }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 8', () => {
        const template = `{{ content
    
    
            markdown='true'				      lower='true' }}`;
        const output = `{{ content markdown='true' lower='true' }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 9', () => {
        const template = `{{ hello:world }}[{{ baz }}]{{ /hello:world }}`;
        const output = `{{ hello:world }}
    [{{ baz }}]
{{ /hello:world }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 10', () => {
        const template = `{{ nested:test:foo:nested }}`;
        const output = `{{ nested:test:foo:nested }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 11', () => {
        const template = `{{ "Thundercats are Go!" }}`;
        const output = `{{ "Thundercats are Go!" }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 12', () => {
        const template = `{{ items | count }}{{ items limit="2" }}<{{ value }}>{{ /items }}`;
        const output = `{{ items | count }}{{ items limit="2" }}
    <{{ value }}>
{{ /items }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 13', () => {
        const template = `{{ items limit="2" }}<{{ value }}>{{ /items }}{{ items | count }}`;
        const output = `{{ items limit="2" }}
    <{{ value }}>
{{ /items }}{{ items | count }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 14', () => {
        const template = `{{ if string == "Hello wilderness" && content }}yes{{ endif }}`;
        const output = `{{ if string == "Hello wilderness" && content }}yes{{ endif }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 15', () => {
        const template = `{{ drink }} {{ food }} {{ activity }}
{{ array }}{{ drink }} {{ food }} -{{ activity }}-{{ /array }}`;
        const output = `{{ drink }} {{ food }}
{{ activity }}
{{ array }}
    {{ drink }} {{ food }}
    -{{ activity }}-
{{ /array }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 16', () => {
        const template = `{{ hello }}{{ value }}, {{ label }}{{ /hello }}`;
        const output = `{{ hello }}
    {{ value }}, {{ label }}
{{ /hello }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 17', () => {
        const template = `{{ test where="type:yup" }}{{ text }}{{ /test }}`;
        const output = `{{ test where="type:yup" }}
    {{ text }}
{{ /test }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 18', () => {
        const template = `before
        {{ simple }}
            {{ foo }}
        {{ /simple }}
        after`;
        const output = `before
{{ simple }}
    {{ foo }}
{{ /simple }}
after`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 19', () => {
        const template = `{{ string
            ? "Pass"
                :			 "Fail" }}`;
        const output = `{{ string ? "Pass" : "Fail" }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 20', () => {
        const template = `{{ if (date
             | modify_date:+3 years | format:Y) ==
              "2015" 
            }}yes{{ endif }}`;
        const output = `{{ if (date | modify_date:+3 years | format:Y) == "2015" }}yes{{ endif }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('template test 21', () => {
        assertFormattedMatches('{{ missing or "Pass" }}', '{{ missing or "Pass" }}');
        assertFormattedMatches('{{ missing || "Pass" }}', '{{ missing || "Pass" }}');
        assertFormattedMatches(`{{ string ?= "Pass" }}`, `{{ string ?= "Pass" }}`);
        assertFormattedMatches('{{ associative:one ?= "Pass" }}', '{{ associative:one ?= "Pass" }}');
        assertFormattedMatches('{{ associative[default_key] ?= "Pass" }}', '{{ associative[default_key] ?= "Pass" }}');
        assertFormattedMatches('{{ missing ?= "Pass" }}', '{{ missing ?= "Pass" }}');
        assertFormattedMatches('{{ missing:thing ?= "Pass" }}', '{{ missing:thing ?= "Pass" }}');
        assertFormattedMatches('{{ missing[thing] ?= "Pass" }}', '{{ missing[thing] ?= "Pass" }}');
        assertFormattedMatches('{{ !string ?= "Pass" }}', '{{ !string ?= "Pass" }}');
        assertFormattedMatches('{{ !associative:one ?= "Pass" }}', '{{ !associative:one ?= "Pass" }}');
        assertFormattedMatches('{{ !associative[default_key] ?= "Pass" }}', '{{ !associative[default_key] ?= "Pass" }}');
        assertFormattedMatches('{{ !missing ?= "Pass" }}', '{{ !missing ?= "Pass" }}');
        assertFormattedMatches('{{ !missing:thing ?= "Pass" }}', '{{ !missing:thing ?= "Pass" }}');
        assertFormattedMatches('{{ !missing[thing] ?= "Pass" }}', '{{ !missing[thing] ?= "Pass" }}');
        assertFormattedMatches('{{ ! string ?= "Pass" }}', '{{ !string ?= "Pass" }}');
        assertFormattedMatches('{{ ! string ?= "Pass" }}', '{{ !string ?= "Pass" }}');
        assertFormattedMatches('{{ !  associative:one ?= "Pass" }}', '{{ !associative:one ?= "Pass" }}');
        assertFormattedMatches('{{ !    associative[default_key] ?= "Pass" }}', '{{ !associative[default_key] ?= "Pass" }}');
        assertFormattedMatches('{{ !     missing ?= "Pass" }}', '{{ !missing ?= "Pass" }}');
        assertFormattedMatches('{{ !       missing:thing ?= "Pass" }}', '{{ !missing:thing ?= "Pass" }}');
        assertFormattedMatches('{{ !         missing[thing] ?= "Pass" }}', '{{ !missing[thing] ?= "Pass" }}');
    });

    test('template test 22', () => {
        const template = `{{ tag:array }}{{ noparse }}{{ string }}{{ /noparse }}{{ /tag:array }}
{{ tag:loop }}
    {{ index }} {{ noparse }}{{ string }}{{ /noparse }} {{ string }}
{{ /tag:loop }}`;
        const output = `{{ tag:array }}
    {{ noparse }}
{{ /tag:array }}
{{ tag:loop }}
    {{ index }} {{ noparse }}
    {{ string }}
{{ /tag:loop }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('it emits escaped content chars', () => {
        const template = `start{{articles}}{{test}}@{{ foo }} {{ qux }}
bar
{{ baz }}{{ /articles }}end`;
        const output = `start{{ articles }}
    {{ test }}@{{ foo }} {{ qux }}
    bar
    {{ baz }}
{{ /articles }}end`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('it emits escpaed content chars 2', () => {
        const template = `@{{ foo
    bar:baz="qux"
  }} {{ qux }}
bar
{{ baz }}`;
        const output = `@{{ foo
    bar:baz="qux"
  }} {{ qux }}
bar
{{ baz }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('it emits strings when appearning after ternary nodes', () => {
        const template = `<html>
<head>
</head>
<body>
<style>
:root {
    --primary-color: {{ theme:primary_color ?? "#FA7268" }};
    --secondary-color: {{ theme:secondary_color ?? "#C62368" }};
    --plyr-color-main: {{ theme:primary_color ?? "#C62368" }};
}
</style>
<script>
window.primaryColor = '{{ theme:primary_color ?? "#FA7268" }}';
window.secondaryColor = '{{ theme:secondary_color ?? "#C62368" }}';
</script>
</body>
</html>`;
        const output = `<html>
<head>
</head>
<body>
    <style>
        :root {
            --primary-color: {{ theme:primary_color ?? "#FA7268" }};
            --secondary-color: {{ theme:secondary_color ?? "#C62368" }};
            --plyr-color-main: {{ theme:primary_color ?? "#C62368" }};
        }
    </style>
    <script>
        window.primaryColor = '{{ theme:primary_color ?? "#FA7268" }}';
        window.secondaryColor = '{{ theme:secondary_color ?? "#C62368" }}';
    </script>
</body>
</html>`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('it does not do weird things with spacing on things not flagged as tags', () => {
        const template = `<html>
        <head>
        </head>
        <body>
        <style>
        :root {
            --primary-color: {{ thxme:primary_color ?? "#FA\\"7268" 
            ?? 23 }};
            --secondary-color: {{ thxmed:secondary_color ?? "#C62368" }};
            --plyr-color-main:    {{ thxmedddd:primary_color
                 ?? "#C62368@@@@@@@@" }};
        }
        </style>
        <script>
        window.primaryColor = '{{ thxmeddddd:primary_color ?? "#FA7268" }}';
        window.secondaryColor = '{{ theme:secondary_color ?? "#C62368" }}';
        </script>
        </body>
        </html>`;
        const output = `<html>
<head>
</head>
<body>
    <style>
        :root {
            --primary-color: {{ thxme:primary_color ?? "#FA\\"7268" ?? 23 }};
            --secondary-color: {{ thxmed:secondary_color ?? "#C62368" }};
            --plyr-color-main: {{ thxmedddd:primary_color ?? "#C62368@@@@@@@@" }};
        }
    </style>
    <script>
        window.primaryColor = '{{ thxmeddddd:primary_color ?? "#FA7268" }}';
        window.secondaryColor = '{{ theme:secondary_color ?? "#C62368" }}';
    </script>
</body>
</html>`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });

    test('it emits escaped content chars 3', () => {
        const template = `@{{ foo bar="{baz}" }}`;
        const output = `@{{ foo bar="{baz}" }}`;
        assert.strictEqual(formatDefaultHtmlSettings(template), output);
    });
});