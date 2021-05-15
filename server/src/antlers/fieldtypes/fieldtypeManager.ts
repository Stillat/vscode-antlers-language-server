import { CompletionItem } from 'vscode-languageserver-types';
import { IBlueprintField } from '../../projects/blueprints';
import { ISuggestionRequest } from '../../suggestions/suggestionManager';
import { Scope } from '../scope/engine';
import { ISymbol } from '../types';
import CoreFieldtypes from './core/coreFieldtypes';

export interface IFieldtypeInjection {
	name: string,
	augmentScope(symbol: ISymbol, scope: Scope): void,
	injectCompletions?(params: ISuggestionRequest, blueprintField: IBlueprintField, symbol: ISymbol): CompletionItem[]
}

export class FieldtypeManager {
	static fieldTypes: Map<string, IFieldtypeInjection> = new Map();

	static registerFieldtypes(types: IFieldtypeInjection[]) {
		for (let i = 0; i < types.length; i++) {
			this.fieldTypes.set(types[i].name, types[i]);
		}
	}

	static loadCoreFieldtypes() {
		this.registerFieldtypes(CoreFieldtypes);
	}

	static hasFieldtype(name: string): boolean {
		return this.fieldTypes.has(name);
	}

}
