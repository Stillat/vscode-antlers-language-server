import { getFieldRuntimeType } from '../projects/blueprintTypes';
import { arrayModifiers } from './modifiers/arrayModifiers';
import { assetModifiers } from './modifiers/assetModifiers';
import { conditionalModifiers } from './modifiers/conditionalModifiers';
import { dateModifiers } from './modifiers/dateModifiers';
import { markupModifiers } from './modifiers/markupModifiers';
import { mathModifiers } from './modifiers/mathModifiers';
import { specialModifiers } from './modifiers/specialModifiers';
import { stringModifiers } from './modifiers/stringModifiers';
import { utilityModifiers } from './modifiers/utilityModifiers';

export interface IModifierReference {
	name: string,
	hasReference: boolean,
	manifestsType: string,
	ref: IModifier | null
}

export interface IModifierMacro {
	name: string,
	modifiers: IModifierReference[],
	manifestsType: string
}

export interface IModifier {
	/**
	 * The name of the modifier.
	 */
	name: string,
	/**
	 * A list of expected types for the modifier.
	 * 
	 * Allowed values are:
	 *   *       - Any
	 *   string  - string
	 *   date    - date
	 *   number  - numeric
	 *   array   - array
	 *   boolean - boolean
	 */
	acceptsType: string[],
	/**
	 * A list of return types for the modifier.
	 * 
	 * Allowed values are:
	 *   *       - Any
	 *   string  - string
	 *   date    - date
	 *   number  - numeric
	 *   array   - array
	 *   boolean - boolean
	 */
	returnsType: string[],
	/**
	 * A user-friendly description of the modifier.
	 */
	description: string,
	/**
	 * A list of acceptable modifier parameters.
	 */
	parameters: IModifierParameter[],
	/**
	 * An optional web URI that will be displayed as part of the modifier suggestion.
	 */
	docLink: string | null,
	/**
	 * Indicates if the modifier can appear as a parameter suggestion for applicable variables.
	 */
	canBeParameter: boolean
}

export interface IModifierParameter {
	/**
	 * The name of the modifier parameter.
	 */
	name: string,
	/**
	 * A user-friendly description of the modifier parameter.
	 */
	description: string
}

export class ModifierManager {
	static registeredModifiers: Map<string, IModifier> = new Map();
	static acceptTypedModifierReference: Map<string, IModifier[]> = new Map();
	static returnTypeModifierReference: Map<string, IModifier[]> = new Map();
	static macros: Map<string, IModifierMacro> = new Map();

	static reset() {
		this.registeredModifiers.clear();
		this.acceptTypedModifierReference.clear();
		this.returnTypeModifierReference.clear();
	}

	static resetMacros() {
		this.macros.clear();
	}

	static loadCoreModifiers() {
		this.registerModifiers(arrayModifiers);
		this.registerModifiers(assetModifiers);
		this.registerModifiers(conditionalModifiers);
		this.registerModifiers(dateModifiers);
		this.registerModifiers(markupModifiers);
		this.registerModifiers(mathModifiers);
		this.registerModifiers(utilityModifiers);
		this.registerModifiers(stringModifiers);
		this.registerModifiers(specialModifiers);
	}

	static registerMacro(macro: IModifierMacro) {
		this.macros.set(macro.name, macro);
	}

	static registerMacros(macros: IModifierMacro[]) {
		for (let i = 0; i < macros.length; i++) {
			this.registerMacro(macros[i]);
		}
	}

	static hasMacro(name: string): boolean {
		if (this.macros.has(name)) {
			const macro = this.macros.get(name);

			if (typeof macro === 'undefined' || macro === null) {
				return false;
			}

			return true;
		}
		return false;
	}

	static getMacro(name: string): IModifierMacro | null {
		if (this.macros.has(name)) {
			const macro = this.macros.get(name);

			if (typeof macro === 'undefined' || macro === null) {
				return null;
			}

			return macro;
		}
		return null;
	}

	static getMacroManifestingType(name: string): string {
		const macro = this.getMacro(name);

		if (macro == null) {
			return '';
		}

		return macro.manifestsType;
	}

	static getRegisteredModifier(name: string): IModifier | null {
		if (this.registeredModifiers.has(name)) {
			return this.registeredModifiers.get(name) as IModifier;
		}

		return null;
	}

	static getModifiersForType(type: string): IModifier[] {
		const lookupType = getFieldRuntimeType(type);

		if (this.acceptTypedModifierReference.has(lookupType)) {
			return this.acceptTypedModifierReference.get(lookupType) as IModifier[];
		}

		return [];
	}

	static getProbableReturnType(modifier: IModifier): string {
		if (modifier == null) {
			return '';
		}

		if (modifier.returnsType.length == 0) {
			return '';
		}

		return modifier.returnsType[0];
	}

	static registerModifiers(modifiers: IModifier[]) {
		for (let i = 0; i < modifiers.length; i++) {
			const curModifier = modifiers[i];

			for (let j = 0; j < curModifier.acceptsType.length; j++) {
				const curAcceptType = curModifier.acceptsType[j];

				if (this.acceptTypedModifierReference.has(curAcceptType) == false) {
					this.acceptTypedModifierReference.set(curAcceptType, []);
				}

				this.acceptTypedModifierReference.get(curAcceptType)?.push(curModifier);
			}

			for (let j = 0; j < curModifier.returnsType.length; j++) {
				const curReturnType = curModifier.returnsType[j];

				if (this.returnTypeModifierReference.has(curReturnType) == false) {
					this.returnTypeModifierReference.set(curReturnType, []);
				}

				this.returnTypeModifierReference.get(curReturnType)?.push(curModifier);
			}

			this.registeredModifiers.set(modifiers[i].name, modifiers[i]);
		}
	}

	static registerModifier(modifier: IModifier) {
		const modifiers: IModifier[] = [];

		modifiers.push(modifier);

		this.registerModifiers(modifiers);
	}

	static getModifier(name: string): IModifier | null {
		if (this.registeredModifiers.has(name) == false) {
			return null;
		}

		const modifier = this.registeredModifiers.get(name);

		if (typeof modifier == 'undefined' || modifier == null) {
			return null;
		}

		return modifier;
	}

	static hasModifier(name: string): boolean {
		if (this.registeredModifiers.has(name)) {
			return false;
		}

		const modifier = this.registeredModifiers.get(name);

		if (typeof modifier == 'undefined' || modifier == null) {
			return false;
		}

		return true;
	}

}
