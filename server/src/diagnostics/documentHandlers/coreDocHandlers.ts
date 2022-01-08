import { IDocumentDiagnosticsHandler } from '../documentHandler';
import EmptyDocumentHandler from './emptyDocumentHandler';

const CoreDocumentHandlers:IDocumentDiagnosticsHandler[] = [
	EmptyDocumentHandler
];

export {CoreDocumentHandlers};