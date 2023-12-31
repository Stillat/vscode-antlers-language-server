import assert from 'assert';
import { AntlersDocument } from '../runtime/document/antlersDocument.js';
import { assertFalse, assertTrue } from './testUtils/assertions.js';

suite("Document Options Test", () => {
    test('formatter is enabled by default', () => {
        const doc = AntlersDocument.fromText('{{ title }}');
        assertTrue(doc.isFormattingEnabled());
    });

    test('formatter can be disabled', () => {
        const doc = AntlersDocument.fromText('{{# @format false #}}');
        assertFalse(doc.isFormattingEnabled());
    });

    test('format enable explicit', () => {
        const doc = AntlersDocument.fromText('{{# @format true #}}');
        assertTrue(doc.isFormattingEnabled());
    });

    test('document options only resolves from first node if its an Antlers comment', () => {
        const doc = AntlersDocument.fromText('Literal Start {{# @format false #}}');
        assertTrue(doc.isFormattingEnabled());
    });
});