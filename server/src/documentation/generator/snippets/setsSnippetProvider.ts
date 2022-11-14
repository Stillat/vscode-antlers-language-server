import { ISet } from '../../../projects/structuredFieldTypes/types';
import { IDocumentationSnippet } from '../types';

export class SetsSnippetProvider {
    static generate(fieldHandle: string, sets: ISet[]): IDocumentationSnippet[] {
        const snippets: IDocumentationSnippet[] = [];

        let checks = '';

        if (sets.length == 1) {
            checks = `    {{ if type == '${sets[0].handle}' }}

    {{ /if }}`;
        } else if (sets.length > 1) {
            const additional = sets.slice(1);
            checks = `    {{ if type == '${sets[0].handle}' }}

`;
            additional.forEach((set) => {
                checks += `    {{ elseif type == '${set.handle}' }}

`;
            });

            checks += '    {{ /if }}';
        }

        const baseTemplate = `{{ ${fieldHandle} }}
${checks}
{{ /${fieldHandle} }}`;

        snippets.push({
            overview: 'Conditionally rendering content based on the current set',
            snippet: baseTemplate
        })

        return snippets;
    }
}