import { DocumentSymbol, DocumentSymbolParams, SymbolKind } from 'vscode-languageserver';
import { Range } from 'vscode-languageserver-textdocument';
import { AntlersParser } from '../antlers/parser';
import { parserInstances } from '../session';
import { truncateString } from '../utils/strings';



export function handleDocumentSymbolRequest(params: DocumentSymbolParams): DocumentSymbol[] {
	const symbols:DocumentSymbol[] = [],
		documentPath = decodeURIComponent(params.textDocument.uri);

	if (parserInstances.has(documentPath)) {
		const parser = parserInstances.get(documentPath) as AntlersParser;

		const parentStack:DocumentSymbol[] = [];

		parser.getSymbols().forEach((symb) => {

			if (symb.isComment) {
				return;
			}

			if (symb.isClosingTag) {
				if (parentStack.length > 0) {
					parentStack.pop();
				}

				return;
			}

			const range:Range = {
				start: {
					character: symb.startOffset,
					line: symb.startLine
				},
				end: {
					character: symb.endOffset,
					line: symb.endOffset
				}
			};

			let kind:SymbolKind = SymbolKind.Field;

			if (symb.isTag) {
				kind = SymbolKind.Package;
			}

			if (!symb.isTag && symb.isClosedBy != null) {
				kind = SymbolKind.Variable;
			}

			let label = symb.name;

			if (symb.methodName != null && symb.methodName.trim().length > 0) {
				label += ':' + symb.methodName;
			}

			if (symb.name == 'if' || symb.isTag) {
				label += ' ' + symb.parameterContent;
			}

			if (label.trim().length == 1 && symb.parameterContent.trim().length > 1) {
				label += ' ' + symb.parameterContent;
			}

			label = truncateString(label, 75);

			const docSymb:DocumentSymbol = {
				range: range,
				kind: kind,
				name: label,
				selectionRange: range
			};

			if (symb.isClosedBy != null) {
				docSymb.children = [];
				parentStack.push(docSymb);

				if (parentStack.length == 1) {
					symbols.push(docSymb);
					return;
				} else if (parentStack.length > 1) {
					const lastRef = parentStack[parentStack.length - 2];
					
					if (lastRef != docSymb) {
						lastRef.children?.push(docSymb);
					}
					return;
				}
			}

			if (symbols.length > 0 && parentStack.length > 0) {
				const lastRef = parentStack[parentStack.length - 1];

				if (lastRef != docSymb) {
					lastRef.children?.push(docSymb);
				} else {
					const asdf = 'asdf';
				}
			} else {
				symbols.push(docSymb);
			}
		});
	}

	return symbols;
}