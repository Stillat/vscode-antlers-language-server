import { StatamicProject, currentStructure } from '../../projects/statamicProject';
import { trimLeft } from '../../utils/strings';
import { ISymbol } from '../types';
import { Scope } from './engine';

export class InjectionManager {
	static fileInjections: Map<string, Map<string, ISymbol[]>> = new Map();

	static registerInjections(fileName: string, symbols: ISymbol[]) {
		if (symbols.length == 0) {
			return;
		}

		// Only register symbols that have items in the parameter cache.
		const newSymbols: ISymbol[] = [];

		for (let i = 0; i < symbols.length; i++) {
			const thisSymbol = symbols[i];

			if (thisSymbol.parameterCache != null && thisSymbol.parameterCache.length > 0) {
				newSymbols.push(thisSymbol);
			}
		}

		if (newSymbols.length > 0) {
			const partialName = newSymbols[0].methodName;

			if (partialName != null && currentStructure != null) {
				const projectPartial = currentStructure.findPartial(partialName);

				if (projectPartial != null) {

					if (!this.fileInjections.has(projectPartial.documentUri)) {
						this.fileInjections.set(projectPartial.documentUri, new Map());
					}

					const partialFiles = this.fileInjections.get(projectPartial.documentUri) as Map<string, ISymbol[]>;

					partialFiles.set(fileName, newSymbols);
				}
			}
		}
	}

	static hasAvailableInjections(documentUri: string): boolean {
		return this.fileInjections.has(documentUri);
	}

	static getScopeInjection(documentUri: string, project: StatamicProject): Scope {
		const newScope = new Scope(project);

		newScope.name = '*injection*';

		const injections = this.fileInjections.get(documentUri) as Map<string, ISymbol[]>;

		injections.forEach((symbols: ISymbol[], file: string) => {
			for (let i = 0; i < symbols.length; i++) {
				const symbol = symbols[i];

				if (symbol.parameterCache != null && symbol.parameterCache.length > 0) {
					for (let j = 0; j < symbol.parameterCache.length; j++) {
						const thisParam = symbol.parameterCache[j];

						if (thisParam.isDynamicBinding == false && thisParam.containsInterpolation == false) {
							newScope.addVariable({
								dataType: 'string',
								name: thisParam.name,
								sourceField: null,
								sourceName: 'scope.injection',
								introducedBy: symbol
							});
						} else if (thisParam.isDynamicBinding) {
							if (symbol.currentScope != null) {
								if (symbol.currentScope.hasListInHistory(thisParam.value)) {
									const injectList = symbol.currentScope.findNestedScope(thisParam.value);

									if (injectList != null) {
										const adjustedName = trimLeft(thisParam.name, ':'),
											nestedInjection = injectList.copy();

										nestedInjection.name = adjustedName;
										newScope.addScopeList(adjustedName, injectList);
									}
								}
							}
						}
					}
				}
			}
		});

		return newScope;
	}

}
