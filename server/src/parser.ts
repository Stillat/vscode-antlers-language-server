// Internal file to test the parser.

import { formatStringWithPrettier } from './formatting/prettier/utils';
import { AntlersDocument } from './runtime/document/antlersDocument';
import { ErrorPrinter } from './runtime/document/printers/errorPrinter';

const template = `{{# Page title #}}
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
const result = formatStringWithPrettier(template).trim();
console.log(result);

var hm = 'asdf';