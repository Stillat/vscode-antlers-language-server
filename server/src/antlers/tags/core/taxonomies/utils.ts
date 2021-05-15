import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { IBlueprintField } from '../../../../projects/blueprints';
import { StatamicProject } from '../../../../projects/statamicProject';
import { getParameterFromLists, ISymbol } from '../../../types';
import { getParameterArrayValue } from '../../parameterFetcher';
import { ExcludeTaxonomyParams, SourceTaxonomyParams } from './resolveTaxonomyParameterCompletions';

export function getTaxonomyNames(symbol: ISymbol, statamicProject: StatamicProject): string[] {
	let taxonomyNames: string[] = [];

	if (symbol.methodName != null && symbol.methodName.trim().length > 0) {
		taxonomyNames.push(symbol.methodName);

		return taxonomyNames;
	}

	const fromParam = getParameterFromLists(SourceTaxonomyParams, symbol),
		restrictParam = getParameterFromLists(ExcludeTaxonomyParams, symbol);
	let fromList: string[] = [],
		notInList: string[] = [];

	if (typeof fromParam !== 'undefined' && fromParam !== null) {
		if (fromParam.value.trim() === '*') {
			fromList = statamicProject.getUniqueTaxonomyNames();

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
		taxonomyNames = fromList.filter(function (n) {
			return notInList.includes(n) == false;
		});
	} else {
		taxonomyNames = fromList;
	}

	return taxonomyNames;
}

export function makeTaxonomyNameSuggestions(existingValues: string[], project: StatamicProject): CompletionItem[] {
	const items: CompletionItem[] = [],
		taxonomyNames = project.getUniqueTaxonomyNames().filter(e => !existingValues.includes(e));

	for (let i = 0; i < taxonomyNames.length; i++) {
		items.push({
			label: taxonomyNames[i],
			kind: CompletionItemKind.Variable
		});
	}

	return items;
}

export function getTaxonomyBlueprintField(symbol: ISymbol): IBlueprintField[] {
	return [];
}
