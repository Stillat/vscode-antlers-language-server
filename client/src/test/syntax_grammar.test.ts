import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as oniguruma from "vscode-oniguruma";
import * as textmate from "vscode-textmate";

const htmlGrammar = {
    scopeName: "text.html.basic",
    patterns: [
        { include: "#tag" }
    ],
    repository: {
        tag: {
            begin: "(</?)([A-Za-z][\\w-]*)(?=\\s|/?>)",
            beginCaptures: {
                1: { name: "punctuation.definition.tag.begin.html" },
                2: { name: "entity.name.tag.html" }
            },
            end: "(/?>)",
            endCaptures: {
                1: { name: "punctuation.definition.tag.end.html" }
            },
            name: "meta.tag.other.html",
            patterns: [
                { include: "#attribute" }
            ]
        },
        attribute: {
            patterns: [
                {
                    begin: "([^\\s\"'<>/=]+)",
                    beginCaptures: {
                        1: { name: "entity.other.attribute-name.html" }
                    },
                    end: "(?=\\s|/?>)",
                    name: "meta.attribute.unrecognized.html",
                    patterns: [
                        {
                            begin: "=",
                            beginCaptures: {
                                0: { name: "punctuation.separator.key-value.html" }
                            },
                            end: "(?=\\s|/?>)",
                            patterns: [
                                {
                                    begin: "\"",
                                    beginCaptures: {
                                        0: { name: "punctuation.definition.string.begin.html" }
                                    },
                                    end: "\"",
                                    endCaptures: {
                                        0: { name: "punctuation.definition.string.end.html" }
                                    },
                                    name: "string.quoted.double.html"
                                },
                                {
                                    begin: "'",
                                    beginCaptures: {
                                        0: { name: "punctuation.definition.string.begin.html" }
                                    },
                                    end: "'",
                                    endCaptures: {
                                        0: { name: "punctuation.definition.string.end.html" }
                                    },
                                    name: "string.quoted.single.html"
                                },
                                {
                                    match: "[^\\s>]+",
                                    name: "string.unquoted.html"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }
} as unknown as textmate.IRawGrammar;

const javascriptGrammar = {
    scopeName: "source.js",
    patterns: [
        { include: "#expression" }
    ],
    repository: {
        expression: {
            patterns: [
                {
                    match: "\\b(false|true|null|undefined)\\b",
                    name: "constant.language.js"
                },
                {
                    match: "!|={1,3}|\\?|:",
                    name: "keyword.operator.js"
                },
                {
                    match: "[A-Za-z_$][\\w$]*",
                    name: "variable.other.readwrite.js"
                }
            ]
        }
    }
} as unknown as textmate.IRawGrammar;

let grammar: textmate.IGrammar;

function findOccurrence(input: string, search: string, occurrence = 0): number {
    let index = -1;

    for (let i = 0; i <= occurrence; i++) {
        index = input.indexOf(search, index + 1);
    }

    assert.notStrictEqual(index, -1, `Could not find ${search} in ${input}`);

    return index;
}

function getToken(line: string, search: string, occurrence = 0, offset = 0) {
    const index = findOccurrence(line, search, occurrence) + offset;
    const tokens = grammar.tokenizeLine(line, textmate.INITIAL).tokens;
    const token = tokens.find((candidate) => candidate.startIndex <= index && candidate.endIndex > index);

    assert.notStrictEqual(token, undefined, `Could not find a token at ${index} in ${line}`);

    return token as textmate.IToken;
}

function assertScope(line: string, search: string, scope: string, occurrence = 0, offset = 0) {
    const token = getToken(line, search, occurrence, offset);

    assert.ok(
        token.scopes.includes(scope),
        `Expected ${search} to include ${scope}, received ${token.scopes.join(", ")}`
    );
}

function assertWithoutScope(line: string, search: string, scope: string, occurrence = 0, offset = 0) {
    const token = getToken(line, search, occurrence, offset);

    assert.ok(
        !token.scopes.includes(scope),
        `Expected ${search} not to include ${scope}, received ${token.scopes.join(", ")}`
    );
}

function assertNoInvalidScopes(line: string) {
    const invalidTokens = grammar.tokenizeLine(line, textmate.INITIAL).tokens.filter((token) => {
        return token.scopes.some((scope) => scope.startsWith("invalid."));
    });

    assert.deepStrictEqual(invalidTokens, []);
}

suite("Syntax Grammar", () => {
    suiteSetup(async () => {
        const wasm = fs.readFileSync(path.resolve("node_modules/vscode-oniguruma/release/onig.wasm"));
        const wasmBuffer = wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength) as ArrayBuffer;

        await oniguruma.loadWASM(wasmBuffer);

        const antlersGrammar = fs.readFileSync(path.resolve("client/syntaxes/antlers.json"), "utf8");
        const registry = new textmate.Registry({
            onigLib: Promise.resolve({
                createOnigScanner(patterns) {
                    return new oniguruma.OnigScanner(patterns);
                },
                createOnigString(input) {
                    return new oniguruma.OnigString(input);
                }
            }),
            loadGrammar: async (scopeName) => {
                if (scopeName == "text.html.statamic") {
                    return textmate.parseRawGrammar(antlersGrammar, "antlers.json");
                }

                if (scopeName == "text.html.basic") {
                    return htmlGrammar;
                }

                if (scopeName == "source.js") {
                    return javascriptGrammar;
                }

                return null;
            }
        });
        const loadedGrammar = await registry.loadGrammar("text.html.statamic");

        assert.notStrictEqual(loadedGrammar, null);
        grammar = loadedGrammar as textmate.IGrammar;
    });

    test("it highlights Antlers expressions between HTML attributes", () => {
        const line = `<a href="{{ url }}" class="tx" {{ is_current ? 'aria-current="page"' : '' }}>{{ title }}</a>`;

        assertScope(line, "is_current", "variable.statamic");
        assertScope(line, "?", "keyword.operator.logical.statamic");
        assertScope(line, "aria-current=\"page\"", "string.quoted.single.statamic");
        assertScope(line, "title", "variable.statamic");
        assertNoInvalidScopes(line);
    });

    test("it preserves modifier strings inside HTML attributes", () => {
        const line = `<iframe src="{{ url | replace('watch?v=','/embed/') }}" frameborder="0">`;

        assertScope(line, "watch?v=", "string.quoted.single.statamic");
        assertScope(line, "/embed/", "string.quoted.single.statamic");
        assertScope(line, "frameborder", "entity.other.attribute-name.html");
        assertNoInvalidScopes(line);
    });

    test("it preserves HTML boundaries around conditional attributes", () => {
        const line = `<a class="nav-link{{ if is_current }} active{{ /if }}"{{ if is_current }} aria-current="page"{{ /if }} href="{{ url }}">`;

        assertScope(line, "{{ if", "keyword.control.statamic", 1, 3);
        assertScope(line, "{{ /if", "keyword.control.statamic", 1, 3);
        assertScope(line, "aria-current", "entity.other.attribute-name.html");
        assertScope(line, "href", "entity.other.attribute-name.html");
        assertNoInvalidScopes(line);
    });

    test("it preserves HTML boundaries after Antlers in style attributes", () => {
        const line = `<li style="background-image: url('{{ glide :src="background_image" w="1920" format="webp" }}');" class="active">`;

        assertScope(line, "background_image", "variable.statamic");
        assertScope(line, "class", "entity.other.attribute-name.html");
        assertScope(line, "active", "string.quoted.double.html");
        assertNoInvalidScopes(line);
    });

    test("it highlights dynamic opening tags and their attributes", () => {
        const line = `<{{ card_html_tag }} class="card">`;

        assertScope(line, "<", "punctuation.definition.tag.begin.html");
        assertScope(line, "card_html_tag", "meta.tag.other.dynamic.html");
        assertScope(line, "card_html_tag", "variable.statamic");
        assertScope(line, "class", "entity.other.attribute-name.html");
        assertScope(line, "\"card\"", "string.quoted.double.html", 0, 1);
        assertScope(line, ">", "punctuation.definition.tag.end.html");
    });

    test("it highlights dynamic closing tags", () => {
        const line = `</{{ card_html_tag }}>`;

        assertScope(line, "</", "punctuation.definition.tag.begin.html");
        assertScope(line, "card_html_tag", "variable.statamic");
        assertScope(line, ">", "punctuation.definition.tag.end.html");
    });

    test("it highlights Antlers component tags and attributes", () => {
        ["s-", "s:", "statamic-", "statamic:"].forEach((prefix) => {
            const line = `<${prefix}collection from="articles"></${prefix}collection>`;

            assertScope(line, "collection", "entity.name.tag.statamic");
            assertScope(line, "from", "entity.other.attribute-name.html");
            assertNoInvalidScopes(line);
        });
    });

    test("it embeds JavaScript in Alpine attributes", () => {
        const line = `<button x-data="{ open: false }" @click="open = !open" :class="{ 'is-open': open }" x-show="open">`;

        assertScope(line, "x-data", "meta.attribute.alpine");
        assertScope(line, "false", "constant.language.js");
        assertScope(line, "@click", "meta.attribute.alpine");
        assertScope(line, "!open", "keyword.operator.js");
        assertScope(line, ":class", "meta.attribute.alpine");
        assertScope(line, "is-open", "meta.embedded.inline.alpinejs");
        assertScope(line, "x-show", "meta.attribute.alpine");
    });

    test("it supports Alpine arguments and modifiers", () => {
        const line = `<div x-on:click.prevent="open = true" x-bind:class="classes"></div>`;

        assertScope(line, "x-on:click.prevent", "meta.attribute.alpine");
        assertScope(line, "true", "constant.language.js");
        assertScope(line, "x-bind:class", "meta.attribute.alpine");
        assertScope(line, "classes", "meta.embedded.inline.alpinejs");
    });

    test("it limits Alpine highlighting to HTML attributes", () => {
        const html = `<div class="x-data"></div>`;
        const antlers = `{{ partial x-data="not_alpine" }}`;

        assertWithoutScope(html, "class", "meta.attribute.alpine");
        assertWithoutScope(antlers, "x-data", "meta.attribute.alpine");
        assertScope(antlers, "x-data", "entity.other.attribute-name");
    });
});
