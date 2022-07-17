// Internal file to test the parser.

import { formatStringWithPrettier } from './formatting/prettier/utils';

const template = `<nav
class="bg-blue mx-auto flex max-w-5xl flex-wrap items-center justify-between py-10 lg:justify-start"
>    <div class="text-md font-medium antialiased">
{{ if something }}
        something -here
{{ else }}
    nope
{{ /if }}
<a href="/" class="mr-12 block text-xl font-black lg:inline-block">
    {{ settings:site_name }}
</a>
</div></nav>`;
const result = formatStringWithPrettier(template).trim();
console.log(result);

var hm = 'asdf';