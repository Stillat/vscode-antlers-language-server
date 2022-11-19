import { IFieldDetails } from '../../../projects/structuredFieldTypes/types';
import { IDocumentationSnippet } from '../types';

export class DateTimeSnippetProvider {
    static generate(field:IFieldDetails):IDocumentationSnippet[] {
        const snippets:IDocumentationSnippet[] = [];

        snippets.push({
            overview: 'Formatting: Atom/ISO-8601 Full Extended (2022-11-19T16:59:46+00:00)',
            snippet: `{{ ${field.handle} | format('Y-m-d\\TH:i:sP') /}}`
        });

        snippets.push({
            overview: 'Formatting: ISO-8601 (2022-11-19T16:59:46+0000)',
            snippet: `{{ ${field.handle} | format('Y-m-d\\TH:i:sO') /}}`
        });

        snippets.push({
            overview: 'Formatting: Cookie (Saturday, 19-Nov-2022 16:59:46 UTC)',
            snippet: `{{ ${field.handle} | format('l, d-M-Y H:i:s T') /}}`
        });

        snippets.push({
            overview: 'Formatting: RFC-822 (Sat, 19 Nov 22 16:59:46 +0000)',
            snippet: `{{ ${field.handle} | format('D, d M y H:i:s O') /}}`
        });

        snippets.push({
            overview: 'Formatting: RFC-850 (Saturday, 19-Nov-22 16:59:46 UTC)',
            snippet: `{{ ${field.handle} | format('l, d-M-y H:i:s T') /}}`
        });

        snippets.push({
            overview: 'Formatting: RFC-1036 (Sat, 19 Nov 22 16:59:46 +0000)',
            snippet: `{{ ${field.handle} | format('D, d M y H:i:s O') /}}`
        });

        snippets.push({
            overview: 'Formatting: RFC-1123 (Sat, 19 Nov 2022 16:59:46 +0000)',
            snippet: `{{ ${field.handle} | format('D, d M Y H:i:s O') /}}`
        });

        snippets.push({
            overview: 'Formatting: RFC-2822 (Sat, 19 Nov 2022 16:59:46 +0000)',
            snippet: `{{ ${field.handle} | format('D, d M Y H:i:s O') /}}`
        });

        snippets.push({
            overview: 'Formatting: RFC-3339 (2022-11-19T16:59:46+00:00)',
            snippet: `{{ ${field.handle} | format('Y-m-d\\TH:i:sP') /}}`
        });

        snippets.push({
            overview: 'Formatting: RFC-3339 Extended (2022-11-19T16:59:46.954+00:00)',
            snippet: `{{ ${field.handle} | format('Y-m-d\\TH:i:s.vP') /}}`
        });

        snippets.push({
            overview: 'Formatting: RFC-7231 (Sat, 19 Nov 2022 16:59:46 GMT)',
            snippet: `{{ ${field.handle} | format('D, d M Y H:i:s \\G\\M\\T') /}}`
        });

        snippets.push({
            overview: 'Formatting: RSS (Sat, 19 Nov 2022 16:59:46 +0000)',
            snippet: `{{ ${field.handle} | format('D, d M Y H:i:s O') /}}`
        });

        snippets.push({
            overview: 'Formatting: W3C (2022-11-19T16:59:46+00:00)',
            snippet: `{{ ${field.handle} | format('Y-m-d\\TH:i:sP') /}}`
        });

        return snippets;
    }
}