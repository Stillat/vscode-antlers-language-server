import { AntlersDocument } from '../../runtime/document/antlersDocument';
import { AntlersError } from '../../runtime/errors/antlersError';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes';
import { IDocumentDiagnosticsHandler } from '../documentHandler';

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
