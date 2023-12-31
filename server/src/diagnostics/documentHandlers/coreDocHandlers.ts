import { IDocumentDiagnosticsHandler } from '../documentHandler.js';
import DynamicClassNameHandler from './dynamicClassNameHandler.js';
import EmptyDocumentHandler from './emptyDocumentHandler.js';
import FrontMatterHandler from './frontMatterHandler.js';
import PartialRecursionHandler from './partialRecursionHandler.js';

const CoreDocumentHandlers: IDocumentDiagnosticsHandler[] = [
    EmptyDocumentHandler,
    FrontMatterHandler,
    PartialRecursionHandler,
    DynamicClassNameHandler
];

export { CoreDocumentHandlers };