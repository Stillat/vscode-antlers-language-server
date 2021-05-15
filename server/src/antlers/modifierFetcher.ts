import { ISymbolModifier } from './modifierAnalyzer';
import { ISymbol } from './types';

export function getModifier(symbol: ISymbol, modifierName: string): ISymbolModifier | null {
	if (symbol.modifiers == null) {
		return null;
	}

	if (symbol.modifiers.hasModifiers == false) { return null; }

	if (symbol.modifiers.hasShorthandModifiers) {
		for (let i = 0; i < symbol.modifiers.shorthandModifiers.length; i++) {
			if (symbol.modifiers.shorthandModifiers[i].name == modifierName) {
				return symbol.modifiers.shorthandModifiers[i];
			}
		}
	}

	if (symbol.modifiers.hasParamModifiers) {
		for (let i = 0; i < symbol.modifiers.paramModifiers.length; i++) {
			if (symbol.modifiers.paramModifiers[i].name == modifierName) {
				return symbol.modifiers.paramModifiers[i];
			}
		}
	}

	return null;
}
