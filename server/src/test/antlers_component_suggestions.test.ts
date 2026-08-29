import assert from 'assert';
import { Position, TextEdit } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Scope } from '../antlers/scope/scope.js';
import { IProjectDetailsProvider } from '../projects/projectDetailsProvider.js';
import { AntlersDocument } from '../runtime/document/antlersDocument.js';
import { getAntlersComponentSuggestions } from '../suggestions/antlersComponentSuggestions.js';
import { ISuggestionRequest } from '../suggestions/suggestionRequest.js';

function makeProject(): IProjectDetailsProvider {
    return {
        getCustomAntlersTags: () => [],
        getBlueprintFields: () => [],
        getCollectionNames: () => ['articles', 'news'],
        getCollectionNamesForView: () => [],
        getCollectionQueryScopes: () => [],
        getOAuthProviders: () => ['github'],
        getSiteNames: () => ['english'],
        hasTaxonomy: () => false,
        hasViewCollectionInjections: () => false,
        getUniqueCollectionNames: () => ['articles', 'news'],
        getUniqueFormNames: () => ['contact'],
        getUniqueNavigationMenuNames: () => ['main'],
        getUniquePartialNames: () => ['cards/card'],
        getUniqueTaxonomyNames: () => ['topics'],
    } as unknown as IProjectDetailsProvider;
}

function suggestionsFor(source: string, sourceRequest?: ISuggestionRequest) {
    const markerOffset = source.indexOf('|'),
        cleanSource = markerOffset >= 0
            ? source.slice(0, markerOffset) + source.slice(markerOffset + 1)
            : source,
        document = TextDocument.create('inmemory://component-test', 'html', 1, cleanSource),
        position = document.positionAt(markerOffset >= 0 ? markerOffset : cleanSource.length);

    return getAntlersComponentSuggestions(
        cleanSource,
        position,
        makeProject(),
        sourceRequest
    );
}

function makeSourceRequestWithVariables(...variables: string[]): ISuggestionRequest {
    const project = makeProject(),
        antlersDocument = AntlersDocument.fromText('{{ placeholder }}\n'),
        node = antlersDocument.getAllAntlersNodes()[0],
        scope = new Scope(project);

    variables.forEach((name) => scope.addVariable({
        name,
        dataType: 'string',
        sourceField: null,
        sourceName: 'test',
        introducedBy: null,
    }));
    node.currentScope = scope;

    return {
        antlersDocument,
        currentNode: node,
        document: 'inmemory://component-test',
        nodesInScope: [node],
        showGeneralSnippets: true,
    } as ISuggestionRequest;
}

function applyEdit(source: string, edit: TextEdit): string {
    const markerOffset = source.indexOf('|'),
        cleanSource = source.slice(0, markerOffset) + source.slice(markerOffset + 1),
        document = TextDocument.create('inmemory://component-test', 'html', 1, cleanSource),
        start = document.offsetAt(edit.range.start),
        end = document.offsetAt(edit.range.end);

    return cleanSource.slice(0, start) + edit.newText + cleanSource.slice(end);
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

    test('it completes component parameter names', () => {
        [
            '<s-collection | >',
            '<s:collection | >',
            '<statamic-collection | >',
            '<statamic:collection | >',
            '<s-collection:articles | >',
        ].forEach((source) => {
            const suggestions = suggestionsFor(source) ?? [];

            assert.strictEqual(suggestions.some((item) => item.label == 'from'), true);
            assert.strictEqual(suggestions.some((item) => item.label == 'limit'), true);
        });
    });

    test('it maps partial parameter edits to the component source', () => {
        const source = '<s-collection fr|>',
            suggestion = (suggestionsFor(source) ?? []).find((item) => item.label == 'from'),
            textEdit = suggestion?.textEdit as TextEdit;

        assert.ok(textEdit);
        assert.strictEqual(applyEdit(source, textEdit), '<s-collection from="$1">');
    });

    test('it completes project values for component parameters', () => {
        const collectionSuggestions = suggestionsFor('<s-collection from="|">') ?? [],
            formSuggestions = suggestionsFor('<s-form:create in="|">') ?? [],
            siteSuggestions = suggestionsFor('<s-get_content locale="|">') ?? [];

        assert.strictEqual(collectionSuggestions.some((item) => item.label == 'articles'), true);
        assert.strictEqual(collectionSuggestions.some((item) => item.label == 'news'), true);
        assert.strictEqual(formSuggestions.some((item) => item.label == 'contact'), true);
        assert.strictEqual(siteSuggestions.some((item) => item.label == 'english'), true);
    });

    test('it maps multiline parameter edits across indentation levels', () => {
        const source = [
                '<div>',
                '\t<s-collection',
                '\t\tfr|',
                '\t>',
                '</div>',
            ].join('\n'),
            suggestion = (suggestionsFor(source) ?? []).find((item) => item.label == 'from'),
            textEdit = suggestion?.textEdit as TextEdit;

        assert.ok(textEdit);
        assert.deepStrictEqual(textEdit.range.start, Position.create(2, 4));
        assert.deepStrictEqual(textEdit.range.end, Position.create(2, 4));
        assert.strictEqual(applyEdit(source, textEdit), [
            '<div>',
            '\t<s-collection',
            '\t\tfrom="$1"',
            '\t>',
            '</div>',
        ].join('\n'));
    });

    test('it handles unfinished quoted component values', () => {
        const suggestions = suggestionsFor('<s-collection from="|') ?? [];

        assert.strictEqual(suggestions.some((item) => item.label == 'articles'), true);
        assert.strictEqual(suggestions.some((item) => item.label == 'news'), true);
    });

    test('it completes scope variables in bound component parameters', () => {
        const suggestions = suggestionsFor(
            '<s-collection :from="|">',
            makeSourceRequestWithVariables('collection_handle')
        ) ?? [];

        assert.strictEqual(suggestions.some((item) => item.label == 'collection_handle'), true);
    });

    test('it handles quoted boundaries and self-closing components', () => {
        const suggestions = suggestionsFor('<s-collection title="a > b" from="|" />') ?? [];

        assert.strictEqual(suggestions.some((item) => item.label == 'articles'), true);
        assert.strictEqual(suggestions.some((item) => item.label == 'news'), true);
    });

    test('it does not repeat existing component parameters', () => {
        const suggestions = suggestionsFor('<s-collection from="articles" | >') ?? [];

        assert.strictEqual(suggestions.some((item) => item.label == 'from'), false);
        assert.strictEqual(suggestions.some((item) => item.label == 'limit'), true);
    });

    test('it ignores component-like text inside HTML attributes', () => {
        assert.strictEqual(suggestionsFor('<section title="<s-collection |">'), null);
    });
});
