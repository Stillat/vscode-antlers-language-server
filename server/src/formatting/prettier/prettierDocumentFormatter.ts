import { DocumentFormatter } from '../documentFormatter.js';
import * as prettier from 'prettier';
import { formatAsHtml, formatPhp, setOptions } from './utils.js';
import { FrontMatterFormatter } from '../frontMatterFormatter.js';
import { ErrorPrinter } from '../../runtime/document/printers/errorPrinter.js';

export class PrettierDocumentFormatter extends DocumentFormatter {

    constructor(options: prettier.ParserOptions) {
        super();

        this.createExtraVirtualStructures = true;
        setOptions(options);

        this.withAsyncHtmlFormatter(formatAsHtml)
            .withYamlFormatter(FrontMatterFormatter.formatFrontMatter)
            .withTransformOptions({
                endNewline: true,
                maxAntlersStatementsPerLine: 3,
                newlinesAfterFrontMatter: 1,
                tabSize: options.tabWidth
            })
            .withAsyncPhpFormatter(formatPhp)
            .withPreFormatter((document) => {
                if (document.errors.hasStructureErrors()) {
                    const firstError = document.errors.getFirstStructureError(),
                        lines = document.getLinesAround((firstError.node?.startPosition?.line ?? 1));

                    throw new SyntaxError(ErrorPrinter.printError(firstError, lines));
                }

                return null;
            });
    }
}
