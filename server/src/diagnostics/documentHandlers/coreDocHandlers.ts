import { IDocumentDiagnosticsHandler } from '../documentHandler';
import EmptyDocumentHandler from './emptyDocumentHandler';
import FrontMatterHandler from './frontMatterHandler';

const CoreDocumentHandlers: IDocumentDiagnosticsHandler[] = [
    EmptyDocumentHandler,
    FrontMatterHandler,
];

export { CoreDocumentHandlers };