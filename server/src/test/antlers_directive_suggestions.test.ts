import assert from 'assert';
import { Position, TextEdit } from 'vscode-languageserver-protocol';
import { getAntlersDirectiveSuggestions } from '../suggestions/antlersDirectiveSuggestions.js';

function suggestionsFor(source: string) {
    return getAntlersDirectiveSuggestions(source, Position.create(0, source.length));
}

suite('Antlers Directive Suggestions', () => {
    test('it completes supported directives', () => {
        const suggestions = suggestionsFor('@') ?? [];

        assert.deepStrictEqual(
            suggestions.map((item) => item.label),
            ['@props', '@aware', '@cascade']
        );
    });

    test('it filters and replaces the complete directive', () => {
        const source = '    @pr',
            suggestion = (suggestionsFor(source) ?? [])[0],
            textEdit = suggestion.textEdit as TextEdit;

        assert.strictEqual(suggestion.label, '@props');
        assert.strictEqual(textEdit.newText, '@props');
        assert.strictEqual(textEdit.range.start.character, source.indexOf('@'));
        assert.strictEqual(textEdit.range.end.character, source.length);
    });

    test('it ignores escaped directives and email-like text', () => {
        assert.strictEqual(suggestionsFor('@@pr'), null);
        assert.strictEqual(suggestionsFor('hello@pr'), null);
    });

    test('it is exclusive for unknown directive prefixes', () => {
        assert.deepStrictEqual(suggestionsFor('@unknown'), []);
    });
});
