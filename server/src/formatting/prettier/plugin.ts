import * as prettier from 'prettier';
import { AntlersSettings } from '../../antlersSettings.js';
import { AntlersDocument } from '../../runtime/document/antlersDocument.js';
import { PrettierDocumentFormatter } from './prettierDocumentFormatter.js';
import { setOptions } from './utils.js';

let formatterOptions: prettier.ParserOptions;
const defaultAntlersSettings: AntlersSettings = {
    formatFrontMatter: false,
    showGeneralSnippetCompletions: true,
    diagnostics: {
        warnOnDynamicCssClassNames: true,
        validateTagParameters: true,
        reportDiagnostics: true,
    },
    trace: { server: 'off' },
    formatterIgnoreExtensions: ['xml'],
    languageVersion: 'runtime'
};

interface IFormattedDocument {
    doc: AntlersDocument,
    result: string
}

const plugin: prettier.Plugin = {
    languages: [
        {
            name: "Antlers",
            parsers: ["antlers"],
            extensions: [".antlers.html", ".antlers.php"],
            vscodeLanguageIds: ["html", "antlers"],
        },
    ],
    parsers: {
        antlers: {
            parse: async function (text: string, options) {
                formatterOptions = options;
                setOptions(options);

                const document = new AntlersDocument();

                document.loadString(text);

                const result = await (new PrettierDocumentFormatter(formatterOptions as prettier.ParserOptions))
                    .formatDocumentAsync(document, defaultAntlersSettings);

                return {
                    doc: document,
                    result: result
                };
            },
            locStart: () => 0,
            locEnd: () => 0,
            astFormat: "antlers",
        }
    },
    printers: {
        antlers: {
            print(path: prettier.AstPath) {
                const doc = path.stack[0] as IFormattedDocument;

                return doc.result;
            }
        }
    },
    defaultOptions: {
        tabWidth: 4,
    },
}

export default plugin;
