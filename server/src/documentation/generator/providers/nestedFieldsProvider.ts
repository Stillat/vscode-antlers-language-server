import { Faker } from '../faker';
import { SnippetBuffer } from '../snippetBuffer';
import { IDocumentationSnippet, IInjectedField } from '../types';

function isArrayLike(fieldType: string): boolean {
    if (fieldType === 'array' || fieldType == 'entry' || fieldType == 'builder' || fieldType == 'entries') {
        return true;
    }

    return false;
}

export class NestedFieldsProvider {
    static generate(rootHandle: string, keys: IInjectedField[], tabSize: number = 4): IDocumentationSnippet[] {
        const snippets: IDocumentationSnippet[] = [];

        if (keys.length == 0) {
            snippets.push(NestedFieldsProvider.generateNestedFields(rootHandle, [Faker.injectedTextField('value', '')], tabSize));

            return snippets;
        }

        snippets.push(NestedFieldsProvider.generateNestedFields(rootHandle, keys, tabSize));
        snippets.push(NestedFieldsProvider.generateDotAccessFields(rootHandle, keys, tabSize));

        return snippets;
    }

    static generateArrayFields(rootHandle: string, keys: IInjectedField[], tabSize: number = 4): IDocumentationSnippet[] {
        const snippets: IDocumentationSnippet[] = [];

        if (keys.length == 0) {
            snippets.push(NestedFieldsProvider.generateNestedFields(rootHandle, [Faker.injectedTextField('value', '')], tabSize));

            return snippets;
        }

        snippets.push(NestedFieldsProvider.generateNestedFields(rootHandle, keys, tabSize));
        snippets.push(NestedFieldsProvider.generateNestedDotAccessFields(rootHandle, '0', keys, tabSize));

        return snippets;
    }

    static generateDotAccessFields(handle: string, keys: IInjectedField[], tabSize: number): IDocumentationSnippet {
        const buffer = new SnippetBuffer(tabSize);

        keys.forEach((field) => {
            if (isArrayLike(field.type)) {
                buffer.pairedFieldAccess(handle, field.name).indent().nestedFieldsComment().nl().closingFieldAccess(handle, field.name);
            } else {
                buffer.fieldAccess(handle, field.name);
            }
        });

        return {
            overview: 'Accessing the nested values of the ' + handle + ' field using "dot" syntax',
            snippet: buffer.toString().trimEnd()
        };
    }

    static generateNestedDotAccessFields(handle: string, accessor: string, keys: IInjectedField[], tabSize: number): IDocumentationSnippet {
        const buffer = new SnippetBuffer(tabSize);

        keys.forEach((field) => {
            if (isArrayLike(field.type)) {
                buffer.pairedAccessorFieldAccess(handle, accessor, field.name);
                buffer.indent().nestedFieldsComment();
                buffer.nl().closingAccessorFieldAccess(handle, accessor, field.name);
            } else {
                buffer.accessorFieldAccess(handle, accessor, field.name);
            }
        });

        return {
            overview: 'Accessing the nested values of the ' + handle + ' field using "dot" syntax',
            snippet: buffer.toString().trimEnd()
        };
    }

    static generateNestedFields(handle: string, keys: IInjectedField[], tabSize: number): IDocumentationSnippet {
        const buffer = new SnippetBuffer(tabSize);

        buffer.opening(handle);

        keys.forEach((field) => {
            if (isArrayLike(field.type)) {
                buffer.indentedField(field.name).nl().indent().indent().nestedFieldsComment().indentedClosing(field.name);
            } else {
                buffer.indentedField(field.name);
            }
        });

        buffer.nl().closing(handle);

        return {
            overview: 'Accessing the nested fields of the ' + handle + ' field within a tag pair.',
            snippet: buffer.toString()
        };
    }
}