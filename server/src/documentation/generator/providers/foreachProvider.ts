import { SnippetBuffer } from '../snippetBuffer';
import { IDocumentationSnippet } from '../types';

export class ForeachProvider {
    static generate(field:string, tabSize: number = 4): IDocumentationSnippet {
        const buffer = new SnippetBuffer(tabSize);

        buffer.opening('foreach:' + field);

        buffer.nl().indent().singleField('key').space().singleField('value');

        buffer.nl().closing('foreach:' + field);

        return {
            overview: 'Iterate the ' + field + ' as a key/value pair',
            snippet: buffer.toString()
        };
    }
}