import { ISymbolModifier } from '../../antlers/modifierAnalyzer';
import { IReportableError, ISymbol } from '../../antlers/types';
import { IDiagnosticsHandler } from '../diagnosticsManager';
import { modifierError, modifierWarning, symbolWarning } from '../utils';

const ModifierRuntimeTypeHandler: IDiagnosticsHandler = {
	checkSymbol(symbol: ISymbol) {
		const issues: IReportableError[] = [];

		if (symbol.modifiers == null) {
			return issues;
		}

		if (symbol.modifiers.hasParamModifiers) {
			let lastModifier: ISymbolModifier | null = null;

			for (let i = 0; i < symbol.modifiers.paramModifiers.length; i++) {
				const thisModifier = symbol.modifiers.paramModifiers[i];

				if (lastModifier == null) {
					lastModifier = thisModifier;
					continue;
				}

				if (lastModifier != null && lastModifier.modifier != null && thisModifier.modifier != null) {
					if (lastModifier.modifier.returnsType.includes('*') || thisModifier.modifier.acceptsType.includes('*')) {
						continue;
					} else {
						const lastModifierReturns = lastModifier.modifier.returnsType;
						let recievedGuess = 'void',
							expectedGuess = 'void';

						const typeOverlap = thisModifier.modifier.acceptsType.some(r => lastModifierReturns.includes(r));

						if (lastModifierReturns.length > 0) {
							recievedGuess = lastModifierReturns[lastModifierReturns.length - 1];
						}

						if (thisModifier.modifier.acceptsType.length > 0) {
							expectedGuess = thisModifier.modifier.acceptsType[0];
						}

						if (!typeOverlap) {
							issues.push(modifierError('Unexpected type supplied to modifier ' + thisModifier.name + '. Expected ' + expectedGuess + ' got ' + recievedGuess + '.', thisModifier));
							break;
						}
					}
				}
			}
		}

		if (symbol.modifiers.hasShorthandModifiers) {
			let lastModifier: ISymbolModifier | null = null;

			for (let i = 0; i < symbol.modifiers.shorthandModifiers.length; i++) {
				const thisModifier = symbol.modifiers.shorthandModifiers[i];

				if (lastModifier == null) {
					lastModifier = thisModifier;
					continue;
				}

				if (lastModifier != null && lastModifier.modifier != null && thisModifier.modifier != null) {
					if (lastModifier.modifier.returnsType.includes('*') || thisModifier.modifier.acceptsType.includes('*')) {
						continue;
					} else {
						const lastModifierReturns = lastModifier.modifier.returnsType;
						let recievedGuess = 'void',
							expectedGuess = 'void';

						const typeOverlap = thisModifier.modifier.acceptsType.some(r => lastModifierReturns.includes(r));

						if (lastModifierReturns.length > 0) {
							recievedGuess = lastModifierReturns[lastModifierReturns.length - 1];
						}

						if (thisModifier.modifier.acceptsType.length > 0) {
							expectedGuess = thisModifier.modifier.acceptsType[0];
						}

						if (!typeOverlap) {
							issues.push(modifierError('Unexpected type supplied to modifier ' + thisModifier.name + '. Expected ' + expectedGuess + ' got ' + recievedGuess + '.', thisModifier));
							break;
						}
					}
				}
			}
		}

		return issues;
	}
};

export default ModifierRuntimeTypeHandler;
