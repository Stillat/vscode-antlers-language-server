import { IDocumentDiagnosticsHandler } from '../documentHandler';
import EmptyDocumentHandler from './emptyDocumentHandler';
import FrontMatterHandler from './frontMatterHandler';
import PartialRecursionHandler from './partialRecursionHandler';

const CoreDocumentHandlers: IDocumentDiagnosticsHandler[] = [
    EmptyDocumentHandler,
    FrontMatterHandler,
    PartialRecursionHandler
];

export { CoreDocumentHandlers };