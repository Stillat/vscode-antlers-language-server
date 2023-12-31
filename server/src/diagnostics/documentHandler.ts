import { AntlersSettings } from '../antlersSettings.js';
import { AntlersDocument } from '../runtime/document/antlersDocument.js';
import { AntlersError } from '../runtime/errors/antlersError.js';

export interface IDocumentDiagnosticsHandler {
    checkDocument(document: AntlersDocument, settings: AntlersSettings): AntlersError[];
}
