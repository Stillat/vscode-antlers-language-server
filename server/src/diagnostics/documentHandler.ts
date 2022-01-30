import { AntlersDocument } from '../runtime/document/antlersDocument';
import { AntlersError } from '../runtime/errors/antlersError';

export interface IDocumentDiagnosticsHandler {
    checkDocument(document: AntlersDocument): AntlersError[];
}
