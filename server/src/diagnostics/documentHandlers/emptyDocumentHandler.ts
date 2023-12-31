import { AntlersDocument } from '../../runtime/document/antlersDocument.js';
import { AntlersError } from '../../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes.js';
import { IDocumentDiagnosticsHandler } from '../documentHandler.js';

const EmptyDocumentHandler: IDocumentDiagnosticsHandler = {
    checkDocument(document: AntlersDocument) {
        const errors: AntlersError[] = [];

        if (document.hasFrontMatter() && document.getContent().trim().length == 0) {
            errors.push(AntlersError.makeSyntaxError(
                AntlersErrorCodes.LINT_FRONT_MATTER_EMPTY_DOCUMENT,
                null,
                'Empty document content with Front Matter will result in "[ErrorException] Undefined index: content".'
            ));
        }

        return errors;
    }
};

export default EmptyDocumentHandler;
