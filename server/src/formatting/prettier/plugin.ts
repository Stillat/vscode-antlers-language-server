import * as prettier from 'prettier';
import { AntlersSettings } from '../../antlersSettings';
import { AntlersDocument } from '../../runtime/document/antlersDocument';
import { PrettierDocumentFormatter } from './prettierDocumentFormatter';
import { setOptions } from './utils';

let formatterOptions:prettier.ParserOptions;
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
            parse: function (text: string, _, options) {
                formatterOptions = options;
                setOptions(options);

                const document = new AntlersDocument();

                return document.loadString(text);
            },
            locStart: () => 0,
            locEnd: () => 0,
            astFormat: "antlers",
        }
    },
    printers: {
        antlers: {
            print (path: prettier.AstPath) {
                const doc = path.stack[0] as AntlersDocument;

                return (new PrettierDocumentFormatter(formatterOptions as prettier.ParserOptions)).formatDocument(doc, defaultAntlersSettings);
            }
        }
    },
    defaultOptions: {
        tabWidth: 4,
    },
}

export = plugin;
