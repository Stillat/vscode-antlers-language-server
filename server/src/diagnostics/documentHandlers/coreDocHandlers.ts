import { IDocumentDiagnosticsHandler } from '../documentHandler';
import DynamicClassNameHandler from './dynamicClassNameHandler';
import EmptyDocumentHandler from './emptyDocumentHandler';
import FrontMatterHandler from './frontMatterHandler';
import PartialRecursionHandler from './partialRecursionHandler';

const CoreDocumentHandlers: IDocumentDiagnosticsHandler[] = [
    EmptyDocumentHandler,
    FrontMatterHandler,
    PartialRecursionHandler,
    DynamicClassNameHandler
];

export { CoreDocumentHandlers };