import * as fs from 'fs';
import * as YAML from 'yaml';
import ModifierManager from '../modifierManager.js';
import { IModifier, IModifierMacro, IModifierReference } from '../modifierTypes.js';

export function parseMacros(macroFile: string): IModifierMacro[] {
    const contents = fs.readFileSync(macroFile, { encoding: 'utf8' }),
        macrosToReturn: IModifierMacro[] = [];

    try {
        let document = YAML.parse(contents);

        if (typeof document === 'undefined' || document === null) {
            return [];
        }

        const macroNames = Object.keys(document);

        for (let i = 0; i < macroNames.length; i++) {
            const name = macroNames[i],
                macroModifiers = document[name],
                modifierReferences: IModifierReference[] = [];

            let macroManifestsType = '';

            if (typeof macroModifiers !== 'undefined' && macroModifiers !== null) {
                const macroModifierNames = Object.keys(macroModifiers);

                for (let j = 0; j < macroModifierNames.length; j++) {
                    const modifierName = macroModifierNames[j],
                        reference: IModifier | null = ModifierManager.instance?.getModifier(modifierName) ?? null;

                    let hasReference = false,
                        manifestsType = '';

                    if (reference != null) {
                        hasReference = true;
                        manifestsType = ModifierManager.instance?.getProbableReturnType(reference, false) ?? '';
                        macroManifestsType = manifestsType;
                    } else {
                        macroManifestsType = '';
                    }

                    modifierReferences.push({
                        hasReference: hasReference,
                        manifestsType: manifestsType,
                        name: modifierName,
                        ref: reference
                    });
                }
            }

            macrosToReturn.push({
                name: name,
                manifestsType: macroManifestsType,
                modifiers: modifierReferences
            });
        }
    } catch (e) {
        // Don't let bad YAML parsing break everything.
    }

    return macrosToReturn;
}
