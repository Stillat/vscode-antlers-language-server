import { IDocumentDiagnosticsHandler } from '../documentHandler';
import DuplicateNeighboringTags from './duplicateNeighboringTags';
import EmptyDocumentHandler from './emptyDocumentHandler';
import FrontMatterHandler from './frontMatterHandler';

const CoreDocumentHandlers:IDocumentDiagnosticsHandler[] = [
	EmptyDocumentHandler,
	FrontMatterHandler,
	DuplicateNeighboringTags
];

export {CoreDocumentHandlers};