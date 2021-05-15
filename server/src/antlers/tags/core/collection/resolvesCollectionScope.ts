import { dataAliasRegex } from '../../../../patterns';
import { StatamicProject } from '../../../../projects/statamicProject';
import { getTrimmedMatch } from '../../../../utils/strings';
import { getScopeName } from '../../../tags';
import { getParameterFromLists, ICollectionContext, ISpecialResolverResults, ISymbol } from '../../../types';
import { getIsPaginated, getParameterArrayValue } from '../../parameterFetcher';
import { CollectionRestrictionParams, CollectionSourceParams } from './parameters';

function getAliasName(tagContents: string): string | null {
	return getTrimmedMatch(dataAliasRegex, tagContents, 1);
}

function getCollectionName(symbol: ISymbol, statamicProject: StatamicProject): string[] | null {
	let collectionNames: string[] = [];

	if (symbol.methodName != null && symbol.methodName.trim().length > 0 && ['count', 'next', 'previous'].includes(symbol.methodName) == false) {
		collectionNames.push(symbol.methodName);

		return collectionNames;
	}

	const fromParam = getParameterFromLists(CollectionSourceParams, symbol),
		restrictParam = getParameterFromLists(CollectionRestrictionParams, symbol);
	let fromList: string[] = [],
		notInList: string[] = [];

	if (typeof fromParam !== 'undefined' && fromParam !== null) {
		if (fromParam.value.trim() === '*') {
			fromList = statamicProject.getUniqueCollectionNames();

			if (typeof restrictParam !== 'undefined' && restrictParam !== null) {
				if (restrictParam.isDynamicBinding == false && restrictParam.containsInterpolation == false) {
					notInList = getParameterArrayValue(restrictParam);
				}
			}
		} else {
			if (fromParam.isDynamicBinding == false && fromParam.containsInterpolation == false) {
				fromList = getParameterArrayValue(fromParam);
			}
		}
	}

	if (notInList.length > 0) {
		collectionNames = fromList.filter(function (n) {
			return notInList.includes(n) == false;
		});
	} else {
		collectionNames = fromList;
	}

	return collectionNames;
}

export function resolveCollectionScope(symbol: ISymbol, project: StatamicProject): ISpecialResolverResults {
	const collectionNames = getCollectionName(symbol, project);
	let isAliased = false,
		isPaginated = false,
		isScoped = false,
		scopeName = null,
		aliasName = '';

	if (symbol.isClosingTag == false) {
		const alias = getAliasName(symbol.content),
			scope = getScopeName(symbol);

		if (alias != null) {
			isAliased = true;
			aliasName = alias;
		}

		if (scope != null) {
			isScoped = true;
			scopeName = scope;
		}

		isPaginated = getIsPaginated(symbol);
	}

	const collectionScope: ICollectionContext = {
		collectionNames: collectionNames ?? [],
		endPosition: symbol.endOffset,
		aliasName: aliasName,
		isAliased: isAliased,
		isScoped: isScoped,
		scopeName: scopeName,
		isStartOfScope: !symbol.isClosingTag,
		line: symbol.startLine,
		startPosition: symbol.startOffset,
		isPaginated: isPaginated,
		excludeCollections: [],
		includeCollections: []
	};

	return {
		context: collectionScope,
		issues: []
	};
}
