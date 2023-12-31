import { AntlersDocument } from '../../runtime/document/antlersDocument.js';
import { AntlersError, ErrorLevel } from '../../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes.js';
import { IDocumentDiagnosticsHandler } from '../documentHandler.js';
import * as yaml from 'js-yaml';
import { Position, Range } from '../../runtime/nodes/position.js';

function reformatMessage(text: string) {
    const parts = text.split(/\r?\n/),
        newMessageParts: string[] = [];

    parts.forEach((part) => {
        const prefixedParts = part.split('|');

        if (prefixedParts.length == 1) {
            newMessageParts.push(part);
        } else if (prefixedParts.length > 1) {
            const firstPart = prefixedParts[0];

            if (parseInt(firstPart.trim()).toString() == firstPart.trim()) {
                const lineNumber = parseInt(firstPart) + 1;
                prefixedParts.shift();
                const remainder = prefixedParts.join('|');
                const lead = ' '.repeat(firstPart.length - lineNumber.toString().length);

                newMessageParts.push(lead + lineNumber.toString() + '|' + remainder);

            } else {
                newMessageParts.push(part);
            }
        }
    });

    return newMessageParts.join("\n");
}

const FrontMatterHandler: IDocumentDiagnosticsHandler = {
    checkDocument(document: AntlersDocument) {
        const errors: AntlersError[] = [];

        if (document.hasFrontMatter()) {
            const frontMatter = document.getFrontMatter();

            try {
                yaml.load(frontMatter, {
                    onWarning: (err) => {
                        const start = new Position(),
                            end = new Position();

                        start.line = err.mark.line + 2;
                        start.char = err.mark.column;
                        end.line = err.mark.line + 2;
                        end.char = err.mark.snippet.length + err.mark.column;

                        const range: Range = {
                            start: start,
                            end: end
                        };

                        const error = new AntlersError();
                        error.errorCode = AntlersErrorCodes.LINT_INVALID_FRONT_MATTER;
                        error.level = ErrorLevel.Warning;
                        error.message = reformatMessage(err.message);
                        error.range = range;

                        errors.push(error);
                    }
                });
            } catch (err) {
                if (err instanceof yaml.YAMLException) {
                    const start = new Position(),
                        end = new Position();

                    start.line = err.mark.line + 2;
                    start.char = err.mark.column;
                    end.line = err.mark.line + 2;
                    end.char = err.mark.snippet.length + err.mark.column;

                    const range: Range = {
                        start: start,
                        end: end
                    };

                    const error = new AntlersError();
                    error.errorCode = AntlersErrorCodes.LINT_INVALID_FRONT_MATTER;
                    error.level = ErrorLevel.Error;
                    error.message = reformatMessage(err.message);
                    error.range = range;

                    errors.push(error);
                }
            }
        }

        return errors;
    }
};

export default FrontMatterHandler;
