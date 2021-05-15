import { StatamicProject } from '../projects/statamicProject';
import { getTrimmedMatch } from '../utils/strings';
import { AntlersParser } from './parser';
import { TagManager } from './tagManager';
import Collection from './tags/core/collection/collection';
import { ICollectionContext, ISymbol } from './types';

const scopeRegex = new RegExp(/scope="([A-Za-z0-9 _]*)"/);

export function getScopeName(symbol: ISymbol): string | null {
	return getTrimmedMatch(scopeRegex, symbol.content, 1);
}

export function getScopeNameFromString(value: string): string | null {
	return getTrimmedMatch(scopeRegex, value, 1);
}

function makeTagPair(name: string) {
	return [name, '/' + name];
}

export function resolveTypedTree(statamicProject: StatamicProject, parserInstance: AntlersParser) {
	for (let i = 0; i < parserInstance.symbols.length; i++) {
		const symbol = parserInstance.symbols[i];

		if (symbol.manifestType === 'array') {
			symbol.mustClose = true;
		}
	}

	resolveTree(statamicProject, parserInstance);
}

export function resolveTree(statamicProject: StatamicProject, parserInstance: AntlersParser) {
	const anonymousClosingPairs: string[] = [];

	// Quick scan to find all the candidate closing pairs in the document.
	for (let i = 0; i < parserInstance.symbols.length; i++) {
		const symbol = parserInstance.symbols[i];

		if (symbol.runtimeName.startsWith('/')) {
			anonymousClosingPairs.push(symbol.runtimeName);
		} else if (symbol.isComment && symbol.content.trim().startsWith('region')) {
			anonymousClosingPairs.push('/region');
		}
	}

	for (let i = 0; i < parserInstance.symbols.length; i++) {
		const symbol = parserInstance.symbols[i];

		if (symbol.isTag) {
			if (symbol.name == Collection.tagName) {
				if (symbol.reference != null) {
					const colRef: ICollectionContext = symbol.reference as ICollectionContext;

					if (colRef.isAliased && colRef.aliasName != null) {
						referenceSymbol(parserInstance, symbol, makeTagPair(colRef.aliasName));
					}

				}
			}

			if (TagManager.requiresClose(symbol)) {
				// The runtimeName will contain a cleaned up version of whatever appears in the document.
				// If the tag is collection, and the method is "articles", the runtime name would be collection:articles.
				if (symbol.runtimeName == 'if' || symbol.runtimeName == 'elseif') {
					referenceClosingTagPairSymbol(parserInstance, symbol, ['elseif', 'else', '/if']);
				} else if (symbol.runtimeName == 'else') {
					referenceClosingTagPairSymbol(parserInstance, symbol, ['/if']);
				} else {
					referenceClosingTagPairSymbol(parserInstance, symbol, ['/' + symbol.runtimeName]);
				}
			} else {
				// What we want to do here is check if the current symbol starts with '/'.
				// If it does, lets look back to see what we can match the tag to.
				if (anonymousClosingPairs.includes('/' + symbol.runtimeName)) {
					referenceClosingTagPairSymbol(parserInstance, symbol, ['/' + symbol.runtimeName]);
				}
			}
		} else {

			if (symbol.mustClose != null) {
				if (symbol.mustClose) {
					referenceClosingTagPairSymbol(parserInstance, symbol, ['/' + symbol.runtimeName]);
				}
			} else {
				let checkName = symbol.runtimeName;

				if (symbol.isComment && symbol.content.trim().startsWith('region')) {
					checkName = 'region';
				}

				// Check if we can resolve anonymous closing variable scope blocks.
				if (anonymousClosingPairs.includes('/' + checkName)) {
					referenceClosingTagPairSymbol(parserInstance, symbol, ['/' + checkName]);
				}
			}
		}

	}
}

function referenceClosingTagPairSymbol(parserInstance: AntlersParser, parent: ISymbol, scanFor: string[]) {
	let referencedCount = 0,
		refStack = 0;

	for (let i = 0; i < parserInstance.symbols.length; i++) {
		const currentSymbol = parserInstance.symbols[i];

		if (parent == currentSymbol) {
			continue;
		}

		if (parent.isComment && parent.content.trim().startsWith('region')) {
			if (currentSymbol.isComment && currentSymbol.content.trim() == '/region') {
				parent.isClosedBy = currentSymbol;
				break;
			}
		}

		if (currentSymbol.runtimeName == parent.runtimeName &&
			currentSymbol.startLine >= parent.startLine && currentSymbol.name != 'elseif') {
			refStack++;
			continue;
		}

		if (
			(scanFor.includes(currentSymbol.name) ||
				scanFor.includes(currentSymbol.runtimeName)
			) && refStack > 0 && currentSymbol.startLine >= parent.startLine) {
			refStack--;
			continue;
		}

		if (currentSymbol.startLine > parent.startLine || (
			currentSymbol.startLine == parent.startLine && currentSymbol.startOffset > parent.endOffset
		)) {
			if ((scanFor.includes(currentSymbol.name) || scanFor.includes(currentSymbol.runtimeName)) && refStack == 0) {
				currentSymbol.belongsTo = parent;
				parent.isClosedBy = currentSymbol;
				referencedCount += 1;
			}

			if (refStack == 0 && referencedCount > 0) {
				break;
			}
		}
	}
}

function referenceSymbol(parserInstance: AntlersParser, parent: ISymbol, scanFor: string[]) {
	const targetCount = scanFor.length;
	let referencedCount = 0;

	for (let i = 0; i < parserInstance.symbols.length; i++) {
		const currentSymbol = parserInstance.symbols[i];

		if (currentSymbol.startLine > parent.startLine || (
			currentSymbol.startLine == parent.startLine && currentSymbol.startOffset > parent.endOffset
		)) {
			if (scanFor.includes(currentSymbol.name) || scanFor.includes(currentSymbol.runtimeName)) {
				currentSymbol.belongsTo = parent;
				referencedCount += 1;
			}

			if (referencedCount == targetCount) {
				break;
			}
		}
	}
}
