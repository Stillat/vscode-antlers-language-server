import { IFieldDetails } from '../../../projects/structuredFieldTypes/types';
import { IDocumentationSnippet } from '../types';

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