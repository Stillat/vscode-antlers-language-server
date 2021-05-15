import { FoldingRange, FoldingRangeParams } from 'vscode-languageserver-protocol';
import { AntlersParser } from '../antlers/parser';
import { parserInstances } from '../session';

export function handleFoldingRequest(_foldingParams: FoldingRangeParams): FoldingRange[] {
	const docPath = decodeURIComponent(_foldingParams.textDocument.uri);

	if (parserInstances.has(docPath) == false) {
		return [];
	}

	const parser = parserInstances.get(docPath) as AntlersParser;

	return parser.getFoldingRanges();
}
