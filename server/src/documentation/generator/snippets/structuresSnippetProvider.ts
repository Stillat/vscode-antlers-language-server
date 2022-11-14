import { IStructuresFieldType } from '../../../projects/structuredFieldTypes/types';
import { IDocumentationSnippet } from '../types';

export default class StructuresSnippetProvider {
    static getSnippets(field: IStructuresFieldType): IDocumentationSnippet[] {
        const snippets: IDocumentationSnippet[] = [];

        if (field.maxItems === 1) {
            snippets.push({
                overview: 'Navigate the structure hierarchy using the nav tag',
                snippet: `{{ nav :from="${field.handle}.handle" }}

{{ /nav }}`
            });
        } else {
            snippets.push({
                overview: 'Navigate the structure hierarchies using the nav tag',
                snippet: `{{ ${field.handle} }}
    {{ nav :from="handle" }}

    {{ /nav }}
{{ /${field.handle} }}`
            })
        }

        return snippets;
    }
}