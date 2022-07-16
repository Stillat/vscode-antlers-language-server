import assert = require('assert');
import { formatAntlers } from './testUtils/formatAntlers';

function assertFormattedMatches(input: string, expected: string) {
    const formatted = formatAntlers(input);

    assert.strictEqual(formatted, expected);
}

suite("Document Formatting Test", () => {
    test('it doesnt remove variable parts with neighboring numeric nodes', () => {
        assert.strictEqual(formatAntlers('{{ assets:0 }}'), '{{ assets:0 }}');
        assert.strictEqual(formatAntlers('{{ assets:0:0 }}'), '{{ assets:0:0 }}');
        assert.strictEqual(formatAntlers('{{ assets:0:0:test }}'), '{{ assets:0:0:test }}');
        assert.strictEqual(formatAntlers('{{ assets.0:0:test }}'), '{{ assets.0:0:test }}');
        assert.strictEqual(formatAntlers('{{ assets.0:0.test }}'), '{{ assets.0:0.test }}');
    });

    test('it preserves hyphens in variables', () => {
        const input = `{{ tag:test-hyphens 
        
}} {{ 5-5 }} {{ test-var - another-var }}`;
        const output = "{{ tag:test-hyphens }} {{ 5 - 5 }} {{ test-var - another-var }}";
        assert.strictEqual(formatAntlers(input), output);
    });

    test('it preserves hyphens in tags', () => {
        const input = `{{ tag:test-hyphens 
        
        }} {{ 5-5 }}`;

        assert.strictEqual(formatAntlers(input), "{{ tag:test-hyphens }} {{ 5 - 5 }}");
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
        assert.strictEqual(formatAntlers(initial), output);
        for (let i = 0; i <= 10; i++) {
            assert.strictEqual(formatAntlers(output), output);
        }
    });

    test('it indents nested pairs nicely', () => {
        const expected = `{{ fields }}
    {{ if something }}
        <div>
            <label></label>
        </div>
    {{ /if }}
{{ /fields }}`;

        assert.strictEqual(formatAntlers(`{{ fields }}
        {{ if something }}
        <div>
        <label></label>
    </div>
        {{ /if}}
    {{ /fields }}`), expected);
    });

    test('it does not collapse branch separators', () => {
        const input = `{{ excerpt ? excerpt | widont : content | strip_tags | safe_truncate:160:... }}`;

        assert.strictEqual(formatAntlers(input), input);
    });

    test('typing sim', () => {
        const template = `{{ something || something && something == 'true' }}`,
            chars = template.split(''),
            inputChars: string[] = [];

        chars.forEach((char) => {
            inputChars.push(char);
            const input = inputChars.join('');

            assert.strictEqual(formatAntlers(input), input);
        });
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

    test('template test 18', () => {
        const template = `before
        {{ simple }}
            <p>{{ foo }}</p>
        {{ /simple }}
        after`;
        const output = `before
{{ simple }}
    <p>{{ foo }}</p>
{{ /simple }}
after`;
        assert.strictEqual(formatAntlers(template), output);
    });
    
    test('template test 17', () => {
        const template = `{{ test where="type:yup" }}{{ text }}{{ /test }}`;
        const output = `{{ test where="type:yup" }}
    {{ text }}
{{ /test }}`;
        assert.strictEqual(formatAntlers(template), output);
    });
    
    test('template test 16', () => {
        const template = `{{ hello }}{{ value }}, {{ label }}{{ /hello }}`;
        const output = `{{ hello }}
    {{ value }}, {{ label }}
{{ /hello }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('template test 15', () => {
        const template = `{{ drink }} {{ food }} {{ activity }}
{{ array }}{{ drink }} {{ food }} -{{ activity }}-{{ /array }}`;
        const output = `{{ drink }} {{ food }} {{ activity }}
{{ array }}
    {{ drink }} {{ food }} -{{ activity }}-
{{ /array }}`;
        assert.strictEqual(formatAntlers(template), output);
    });
    
    test('template test 13', () => {
        const template = `{{ items limit="2" }}<{{ value }}>{{ /items }}{{ items | count }}`;
        const output = `{{ items limit="2" }}
    <{{ value }}>
{{ /items }}
{{ items | count }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('template test 12', () => {
        const template = `{{ items | count }}{{ items limit="2" }}<{{ value }}>{{ /items }}`;
        const output = `{{ items | count }}
{{ items limit="2" }}
    <{{ value }}>
{{ /items }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('smart line breaking', () => {
        const template = `{{ tag:array }}{{ noparse }}{{ string }}{{ /noparse }}{{ /tag:array }}
        {{ tag:loop }} <p>{{ index }} {{ noparse }}{{ string }}{{ /noparse }} {{ string }}</p> {{ /tag:loop }}
        
        
        {{ items | count }}{{ items limit="2" }}<{{ value }}>{{ /items }}`;
        const output = `{{ tag:array }}
    {{ noparse }}{{ string }}{{ /noparse }}
{{ /tag:array }}
{{ tag:loop }}
    <p>
        {{ index }} {{ noparse }}{{ string }}{{ /noparse }} {{ string }}
    </p>
{{ /tag:loop }}
{{ items | count }}
{{ items limit="2" }}
    <{{ value }}>
{{ /items }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('smart line breaking 2', () => {
        const template = `
        {{ items | count }}{{ items limit="2" }}<{{ value }}>{{ /items }}
        <ul><li>{{ item:title }}.{{ item:foo }}.{{ foo }}{{ if item:children }}test{{/if}}</li></ul>
        `;
        const expected = `{{ items | count }}
{{ items limit="2" }}
    <{{ value }}>
{{ /items }}
<ul>
    <li>{{ item:title }}.{{ item:foo }}.{{ foo }}
        {{ if item:children }}
            test
        {{ /if }}
    </li>
</ul>`;
        assert.strictEqual(formatAntlers(template), expected);
    });

    test('template test 1', () => {
        const template = `{{ loopvar }}{{ one }}{{ test:some_parsing var="two" }}{{ two }}{{ /test:some_parsing }}{{ /loopvar }}`;
        const output = `{{ loopvar }}
    {{ one }}
    {{ test:some_parsing var="two" }}
        {{ two }}
    {{ /test:some_parsing }}
{{ /loopvar }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('template test 2', () => {
        const template = `{{ object }}{{ one }} {{ two }}{{ /object }}`;
        const output = `{{ object }}
    {{ one }} {{ two }}
{{ /object }}`;
        assert.strictEqual(formatAntlers(template), output);
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
    {{ string }}, {{ count or "0" }}, {{ index or "0" }}, {{ total_results }}
    {{ if first }}
        first
    {{ elseif last }}
        last
    {{ else }}
        neither
    {{ /if }}
{{ /complex }}
after`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('template test 4', () => {
        const template = `{{ if complex_string }}{{ complex_string }}{{ /if }}{{ complex }}{{ /complex }}`;
        const output = `{{ if complex_string }}
    {{ complex_string }}
{{ /if }}
{{ complex }}
{{ /complex }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('template test 5', () => {
        const template = `{{             string          ?       "Pass" : "Fail" }}`;
        const output = `{{ string ? "Pass" : "Fail" }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('template test 6', () => {
        const template = `{{ associative[default_key] | upper | lower }}`;
        const output = `{{ associative[default_key] | upper | lower }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('template test 7', () => {
        const template = `{{ associative[default_key] upper='true' }}`;
        const output = `{{ associative[default_key] upper='true' }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('template test 8', () => {
        const template = `{{ content
    
    
            markdown='true'				      lower='true' }}`;
        const output = `{{ content markdown='true' lower='true' }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('template test 9', () => {
        const template = `{{ hello:world }}[{{ baz }}]{{ /hello:world }}`;
        const output = `{{ hello:world }}
    [{{ baz }}]
{{ /hello:world }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('template test 10', () => {
        const template = `{{ nested:test:foo:nested }}`;
        const output = `{{ nested:test:foo:nested }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('template test 11', () => {
        const template = `{{ "Thundercats are Go!" }}`;
        const output = `{{ "Thundercats are Go!" }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('it wraps on automatic statement separators', () => {
        assert.strictEqual(formatAntlers(`{{ test = 1 + 
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
        assert.strictEqual(formatAntlers(`{{ now   |   timezone   |   format:         r  }}`), '{{ now | timezone | format:r }}');
    });

    test('it preserves simple method chains', () => {
        assert.strictEqual(formatAntlers('<div>{{ hello:there():chained() }}</div>'),
            `<div>{{ hello:there():chained() }}</div>`);
    });

    test('it emits the php nodes', () => {
        const template = `{{$ $test = 10; $}}abvc {{? $hello = 10; ?}}`;
        assert.strictEqual(formatAntlers(template), `{{$ $test = 10; $}}abvc {{? $hello = 10; ?}}`);
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

        assert.strictEqual(formatAntlers(`{{#
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
        assert.strictEqual(formatAntlers(template), output);
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
        assert.strictEqual(formatAntlers(template), output);
    });
    
    test('basic nodes', () => {
        assert.strictEqual(formatAntlers(`{{ var += ' test!'; var }}`), `{{ var += ' test!'; var }}`);
        assert.strictEqual(formatAntlers(`{{ meta_title["No Title Set"] ?? title param="Test" }}`), `{{ meta_title["No Title Set"] ?? title param="Test" }}`);
        assert.strictEqual(formatAntlers('{{# {{ collection:count from="articles" }} #}}'), '{{# {{ collection:count from="articles" }} #}}');
        assert.strictEqual(formatAntlers('{{ view:test[hello] | upper:test:param:"hello :|" | lower }}'), '{{ view:test[hello] | upper:test:param:"hello :|" | lower }}');
        assert.strictEqual(formatAntlers('{{ view:test[view:test[nested:data[more:nested[keys]]]]   }}'), '{{ view:test[view:test[nested:data[more:nested[keys]]]] }}');
        assert.strictEqual(formatAntlers(`{{ (view:test[hello] | upper:test:param:"hello :|" | lower) == (view:title|lower)}}`), `{{ (view:test[hello] | upper:test:param:"hello :|" | lower) == (view:title | lower) }}`);
        assert.strictEqual(formatAntlers(`{{ size = size ? sizes[size] : sizes["md"]; size }}`), `{{ size = size ? sizes[size] : sizes["md"]; size }}`);
        assert.strictEqual(formatAntlers(`{{(view:test[hello]|upper:test:param:"hello :|"|lower)==(view:title|lower)}}`), `{{ (view:test[hello] | upper:test:param:"hello :|" | lower) == (view:title | lower) }}`);
        assert.strictEqual(formatAntlers(`{{		 view:data:test[nested.key[path:path1]]|upper|lower }}`), `{{ view:data:test[nested.key[path:path1]] | upper | lower }}`);
        const output = `{{# A comment #}}
{{# another comment {{ width }} #}}
<div class="max-w-2xl mx-auto mb-32">
    <p>test</p> {{ subtitle }}
</div>`;

        assert.strictEqual(formatAntlers(`{{# A comment #}}
        {{# another comment {{ width }} #}}
        <div class="max-w-2xl mx-auto mb-32">
        <p>test</p> {{ subtitle }}
        </div>`), output);
    });

    test('it produces reasonable indentation', () => {
        const output = `{{ bard raw="true" }}
    {{ type }}
    {{ attrs | length }}
    {{ if attrs | length > 0 }}
        {{ attrs:values:type }}
    {{ /if }}
{{ /bard }}`;
        assert.strictEqual(
            formatAntlers(`{{ bard raw="true" }}
            {{ type }}
            {{ attrs | length }}
            {{ if attrs | length > 0 }}{{ attrs:values:type }}{{ /if }}
            {{ /bard }}`),
            output
        );
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

        assert.strictEqual(formatAntlers(`{{#
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

    test('it emits nested interpolations', () => {
        assert.strictEqual(
            formatAntlers(`{{ 
    
    
                test variable='{ true		 ? 'Hello wilderness - {{default_key}}' 
                : 'fail' }' }}`),
            `{{ test variable='{ true ? 'Hello wilderness - {{default_key}}' : 'fail'}' }}`
        );
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
        assert.strictEqual(formatAntlers(template), output);
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
        assert.strictEqual(formatAntlers(template), output);
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
        assert.strictEqual(formatAntlers(template), output);
    });

    test('it preserves literal node order', () => {
        const template = `{{ tag as="stuff" }}
        before
        {{ stuff }}
        <span>{{ foo }}</span>
        {{ /stuff }}
        after
        {{ /tag }}`;
        const output = `{{ tag as="stuff" }}
    before
    {{ stuff }}
        <span>{{ foo }}</span>
    {{ /stuff }}
    after
{{ /tag }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('it produces reasonable indentation on documents without HTML elements', () => {
        const template = `{{ food }} {{ drink }}
{{ array scope="s" }}
-{{ s:food }}- {{ s:drink }} {{ food }} {{ drink }}
{{ /array }}`;
        const output = `{{ food }} {{ drink }}
{{ array scope="s" }}
        -{{ s:food }}- {{ s:drink }} {{ food }} {{ drink }}
{{ /array }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('it produces reasonable indentation on documents without HTML elements 2', () => {
        const template = `{{ drink }} {{ food }} {{ activity }}
{{ tag }}{{ drink }} {{ food }} -{{ activity }}-{{ /tag }}`;
        const output = `{{ drink }} {{ food }} {{ activity }}
{{ tag }}
    {{ drink }} {{ food }} -{{ activity }}-
{{ /tag }}`;
        assert.strictEqual(formatAntlers(template), output);
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
        assert.strictEqual(formatAntlers(template), output);
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
        assert.strictEqual(formatAntlers(template), output);
    });
});