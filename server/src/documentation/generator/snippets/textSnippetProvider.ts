import { IFieldDetails } from '../../../projects/structuredFieldTypes/types.js';
import { IDocumentationSnippet } from '../types.js';

export class TextSnippetProvider {
    static getSnippets(field: IFieldDetails): IDocumentationSnippet[] {
        const snippets: IDocumentationSnippet[] = [];

        snippets.push({
            overview: 'Retrieving the augmented value of the field',
            snippet: `{{ ${field.handle} /}}`
        });

        return snippets;
    }
}