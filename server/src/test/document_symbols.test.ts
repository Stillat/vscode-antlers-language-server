import assert from "assert";
import { DocumentSymbol } from "vscode-languageserver";
import { sessionDocuments } from "../languageService/documents.js";
import { handleDocumentSymbolRequest } from "../services/documentSymbols.js";

function flattenSymbols(symbols: DocumentSymbol[]): DocumentSymbol[] {
    return symbols.flatMap((symbol) => [
        symbol,
        ...flattenSymbols(symbol.children ?? []),
    ]);
}

suite("Document Symbols", () => {
    test("it omits empty Antlers tags from nested document symbols", () => {
        const uri = "file:///document-symbols.antlers.html";
        const source = "{{ collection:articles }}{{ entries }}{{ if featured }}{{}}{{ }}{{\n}}{{ title }}{{ /if }}{{ /entries }}{{ /collection:articles }}";

        sessionDocuments.createOrUpdate(uri, source);

        const symbols = handleDocumentSymbolRequest({ textDocument: { uri } });
        const names = flattenSymbols(symbols).map((symbol) => symbol.name);

        assert.deepStrictEqual(names, [
            " collection:articles ",
            " entries ",
            " if featured ",
            " title ",
        ]);
        assert.ok(names.every((name) => name.trim().length > 0));
    });
});
