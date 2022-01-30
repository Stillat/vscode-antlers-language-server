const GenericLocalesSnippet = `{{# Displays your site's current locale. #}}
<span>{{ site:short_locale }}</span>

{{# Displays all available locales. #}}
<ul>
    {{ locales all="true" self="false" }}
    <li>
        <a href="{{ permalink }}" aria-label="{{ locale:name }}">{{ locale:short }}</a>
    </li>    
    {{ /locales }}
</ul>`;

export { GenericLocalesSnippet };
