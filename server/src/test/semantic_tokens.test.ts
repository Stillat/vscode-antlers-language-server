import assert from "assert";
import { TextDocument } from "vscode-languageserver-textdocument";
import { sessionDocuments } from "../languageService/documents.js";
import { newSemanticTokenProvider, semanticTokenLegend } from "../services/semanticTokens.js";

interface DecodedToken {
    line: number;
    character: number;
    length: number;
    type: string;
    modifiers: number;
}

function decode(data: number[]): DecodedToken[] {
    const tokens: DecodedToken[] = [];
    let line = 0;
    let character = 0;

    for (let index = 0; index < data.length; index += 5) {
        line += data[index];
        character = data[index] === 0
            ? character + data[index + 1]
            : data[index + 1];
        tokens.push({
            line,
            character,
            length: data[index + 2],
            type: semanticTokenLegend.tokenTypes[data[index + 3]],
            modifiers: data[index + 4]
        });
    }

    return tokens;
}

suite("Semantic Tokens", () => {
    test("it emits standard, correctly aligned Antlers tokens", async () => {
        const uri = "file:///semantic-token-test.antlers.html";
        const text = "{{ collection:articles limit=\"5\" }}\n{{ title | upper }}";
        sessionDocuments.createOrUpdate(uri, text);
        const document = TextDocument.create(uri, "antlers", 1, text);

        const tokens = decode(
            await newSemanticTokenProvider().getSemanticTokens(document)
        );

        assert.deepStrictEqual(
            tokens.map(({ line, character, length, type }) => ({ line, character, length, type })),
            [
                { line: 0, character: 3, length: 19, type: "function" },
                { line: 0, character: 23, length: 5, type: "parameter" },
                { line: 1, character: 3, length: 5, type: "variable" },
                { line: 1, character: 11, length: 5, type: "method" }
            ]
        );
    });

    test("it filters range-token requests", async () => {
        const uri = "file:///semantic-token-range-test.antlers.html";
        const text = "{{ title }}\n{{ subtitle }}";
        sessionDocuments.createOrUpdate(uri, text);
        const document = TextDocument.create(uri, "antlers", 1, text);

        const tokens = decode(await newSemanticTokenProvider().getSemanticTokens(
            document,
            [{ start: { line: 1, character: 0 }, end: { line: 1, character: 14 } }]
        ));

        assert.deepStrictEqual(
            tokens.map(({ line, character, length, type }) => ({ line, character, length, type })),
            [{ line: 1, character: 3, length: 8, type: "variable" }]
        );
    });
});
