import { AntlersError } from '../../errors/antlersError.js';

export class ErrorPrinter {
    static printError(error: AntlersError, lines: Map<number, string>): string {
        let result = `[${error.errorCode}] ${error.message}\n\n`;
        const line = error.node?.startPosition?.line as number;

        let maxLine = line;

        lines.forEach((text, lineNumber) => {
            maxLine = lineNumber;
        });

        const maxLineLen = maxLine.toString().length;

        lines.forEach((lineText, lineNumber) => {
            const curLineString = lineNumber.toString();
            let prefix = '',
                linePaddingLen = 0;

            linePaddingLen = maxLineLen - curLineString.length;

            if (line == lineNumber) {
                prefix = ' >' + '0'.repeat(linePaddingLen) + curLineString + '| ';
            } else {
                prefix = '  ' + '0'.repeat(linePaddingLen) + curLineString + '| ';
            }

            result += prefix + lineText + "\n";
        });


        return result;
    }
}
