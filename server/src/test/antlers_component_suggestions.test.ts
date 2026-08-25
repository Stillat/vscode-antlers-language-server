import assert from 'assert';
import { Position, TextEdit } from 'vscode-languageserver-protocol';
import { IProjectDetailsProvider } from '../projects/projectDetailsProvider.js';
import { getAntlersComponentSuggestions } from '../suggestions/antlersComponentSuggestions.js';

function makeProject(): IProjectDetailsProvider {
    return {
        getCustomAntlersTags: () => [],
        getOAuthProviders: () => ['github'],
        getSiteNames: () => ['english'],
        getUniqueCollectionNames: () => ['articles', 'news'],
        getUniqueFormNames: () => ['contact'],
        getUniqueNavigationMenuNames: () => ['main'],
        getUniquePartialNames: () => ['cards/card'],
        getUniqueTaxonomyNames: () => ['topics'],
    } as unknown as IProjectDetailsProvider;
}

function suggestionsFor(source: string) {
    return getAntlersComponentSuggestions(
        source,
        Position.create(0, source.length),
        makeProject()
    );
}

suite('Antlers Component Suggestions', () => {
    test('it completes dynamic collection components', () => {
        [
            '<s-collection:',
            '<s:collection:',
            '<statamic-collection:',
            '<statamic:collection:',
        ].forEach((source) => {
            const suggestions = suggestionsFor(source) ?? [];

            assert.strictEqual(suggestions.some((item) => item.label == 'collection:articles'), true);
            assert.strictEqual(suggestions.some((item) => item.label == 'collection:news'), true);
        });
    });

    test('it replaces only the component tag fragment', () => {
        const source = '    <s-collection:',
            suggestion = (suggestionsFor(source) ?? []).find((item) => item.label == 'collection:articles'),
            textEdit = suggestion?.textEdit as TextEdit;

        assert.strictEqual(textEdit.newText, 'collection:articles');
        assert.strictEqual(textEdit.range.start.character, source.indexOf('collection:'));
        assert.strictEqual(textEdit.range.end.character, source.length);
    });

    test('it limits closing suggestions to pair-capable tags', () => {
        const collectionSuggestions = suggestionsFor('</s-collection:') ?? [],
            viteSuggestions = suggestionsFor('</s-vite:') ?? [];

        assert.strictEqual(collectionSuggestions.some((item) => item.label == 'collection:articles'), true);
        assert.strictEqual(viteSuggestions.some((item) => item.label == 'vite:content'), false);
    });

    test('it ignores regular HTML contexts', () => {
        assert.strictEqual(suggestionsFor('<section class="s-collection"'), null);
    });
});
