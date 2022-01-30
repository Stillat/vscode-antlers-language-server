import { getFieldRuntimeType } from "../projects/blueprints/blueprintTypes";
import { arrayModifiers } from "./modifiers/arrayModifiers";
import { assetModifiers } from "./modifiers/assetModifiers";
import { conditionalModifiers } from "./modifiers/conditionalModifiers";
import { dateModifiers } from "./modifiers/dateModifiers";
import { markupModifiers } from "./modifiers/markupModifiers";
import { mathModifiers } from "./modifiers/mathModifiers";
import { specialModifiers } from "./modifiers/specialModifiers";
import { stringModifiers } from "./modifiers/stringModifiers";
import { utilityModifiers } from "./modifiers/utilityModifiers";
import { IModifier, IModifierMacro } from "./modifierTypes";

class ModifierManager {
    private registeredModifiers: Map<string, IModifier> = new Map();
    private acceptTypedModifierReference: Map<string, IModifier[]> = new Map();
    private returnTypeModifierReference: Map<string, IModifier[]> = new Map();
    private macros: Map<string, IModifierMacro> = new Map();
    private modifierNameCache: string[] = [];

    public static instance: ModifierManager | null = null;

    reset() {
        this.modifierNameCache = [];
        this.registeredModifiers.clear();
        this.acceptTypedModifierReference.clear();
        this.returnTypeModifierReference.clear();
    }

    getRegisteredModifiers(): Map<string, IModifier> {
        return this.registeredModifiers;
    }

    resetMacros() {
        this.macros.clear();
    }

    loadCoreModifiers() {
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

    getModifierNames() {
        return this.modifierNameCache;
    }

    registerMacro(macro: IModifierMacro) {
        this.macros.set(macro.name, macro);
    }

    registerMacros(macros: IModifierMacro[]) {
        for (let i = 0; i < macros.length; i++) {
            this.registerMacro(macros[i]);
        }
    }

    hasMacro(name: string): boolean {
        if (this.macros.has(name)) {
            const macro = this.macros.get(name);

            if (typeof macro === "undefined" || macro === null) {
                return false;
            }

            return true;
        }
        return false;
    }

    getMacro(name: string): IModifierMacro | null {
        if (this.macros.has(name)) {
            const macro = this.macros.get(name);

            if (typeof macro === "undefined" || macro === null) {
                return null;
            }

            return macro;
        }
        return null;
    }

    getMacroManifestingType(name: string): string {
        const macro = this.getMacro(name);

        if (macro == null) {
            return "";
        }

        return macro.manifestsType;
    }

    getRegisteredModifier(name: string): IModifier | null {
        if (this.registeredModifiers.has(name)) {
            return this.registeredModifiers.get(name) as IModifier;
        }

        return null;
    }

    getModifiersForType(type: string): IModifier[] {
        const lookupType = getFieldRuntimeType(type);

        if (this.acceptTypedModifierReference.has(lookupType)) {
            return this.acceptTypedModifierReference.get(lookupType) as IModifier[];
        }

        return [];
    }

    getProbableReturnType(modifier: IModifier, isTagPair: boolean): string {
        if (modifier == null) {
            return "";
        }

        if (modifier.returnsType.length == 0) {
            return "";
        }

        if (isTagPair && modifier.returnsType.includes('array')) {
            return 'array';
        }

        return modifier.returnsType[0];
    }

    registerModifiers(modifiers: IModifier[]) {
        for (let i = 0; i < modifiers.length; i++) {
            const curModifier = modifiers[i];

            this.modifierNameCache.push(curModifier.name);

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

    registerModifier(modifier: IModifier) {
        const modifiers: IModifier[] = [];

        modifiers.push(modifier);

        this.registerModifiers(modifiers);
    }

    getModifier(name: string): IModifier | null {
        if (this.registeredModifiers.has(name) == false) {
            return null;
        }

        const modifier = this.registeredModifiers.get(name);

        if (typeof modifier == "undefined" || modifier == null) {
            return null;
        }

        return modifier;
    }

    hasModifier(name: string): boolean {
        if (!this.registeredModifiers.has(name)) {
            return false;
        }

        const modifier = this.registeredModifiers.get(name);

        if (typeof modifier == "undefined" || modifier == null) {
            return false;
        }

        return true;
    }
}

if (
    typeof ModifierManager.instance == "undefined" ||
    ModifierManager.instance == null
) {
    ModifierManager.instance = new ModifierManager();
    ModifierManager.instance.loadCoreModifiers();
}

export default ModifierManager;
