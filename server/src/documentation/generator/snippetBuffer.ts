import { IInjectedField } from './types.js';

export class SnippetBuffer {
    private buffer = '';
    private tabSize: number = 4;

    constructor(tabSize: number) {
        this.tabSize = tabSize;
    }

    opening(tagName: string) {
        this.buffer += '{{ ' + tagName + ' }}';

        return this;
    }

    append(text: string) {
        this.buffer += text;

        return this;
    }

    space() {
        return this.append(' ');
    }

    singleField(handle: string) {
        return this.append('{{ ' + handle + ' }}');
    }

    nestedFieldsComment() {
        return this.append('{{# Nested fields. #}}');
    }

    nl() {
        this.buffer += "\n";

        return this;
    }

    indent() {
        this.buffer += ' '.repeat(this.tabSize);

        return this;
    }

    indentedField(field: string) {
        this.buffer += "\n" + ' '.repeat(this.tabSize) + '{{ ' + field + ' }}';

        return this;
    }

    indentedClosing(field: string) {
        this.buffer += "\n" + ' '.repeat(this.tabSize) + '{{/ ' + field + ' }}';

        return this;
    }

    fieldAccess(handle: string, field: string) {
        this.buffer += '{{ ' + handle + '.' + field + ' /}}';

        return this.nl();
    }

    pairedFieldAccess(handle: string, field: string) {
        this.buffer += '{{ ' + handle + '.' + field + ' }}';

        return this.nl();
    }

    closingFieldAccess(handle: string, field: string) {
        this.buffer += '{{ /' + handle + '.' + field + ' }}';

        return this.nl();
    }

    accessorFieldAccess(handle: string, accessor: string, field: string) {
        this.buffer += '{{ ' + handle + '.' + accessor + '.' + field + ' /}}';

        return this.nl();
    }

    pairedAccessorFieldAccess(handle: string, accessor: string, field: string) {
        this.buffer += '{{ ' + handle + '.' + accessor + '.' + field + ' }}';

        return this.nl();
    }

    closingAccessorFieldAccess(handle: string, accessor: string, field: string) {
        this.buffer += '{{ /' + handle + '.' + accessor + '.' + field + ' }}';

        return this.nl();
    }

    closing(tagName: string) {
        this.buffer += '{{ /' + tagName + ' }}';

        return this;
    }

    toString(): string {
        return this.buffer;
    }
}