import ModifierManager from "../../antlers/modifierManager.js";
import { IModifier } from '../../antlers/modifierTypes.js';
import { AntlersNode } from '../nodes/abstractNode.js';

export class ModifierAnalyzer {
    static analyzeModifierNodeParameters(node: AntlersNode) {
        node.parameters.forEach((parameter) => {
            parameter.isModifierParameter =
                ModifierManager.instance?.hasModifier(parameter.name) ?? false;

            if (parameter.isModifierParameter) {
                node.modifiers.parameterModifiers.push(parameter);
                parameter.modifier = ModifierManager.instance?.getModifier(parameter.name) ?? null;

                if (node.modifiers.modifierNames.includes(parameter.name) == false) {
                    node.modifiers.modifierNames.push(parameter.name);
                }
            }
        });

        if (node.modifierChain != null && node.modifierChain.modifierChain.length > 0) {
            let lastModifier: IModifier | null = null;

            node.modifierChain.modifierChain.forEach((modifier) => {
                if (modifier.nameNode != null) {
                    modifier.modifier = ModifierManager.instance?.getModifier(modifier.nameNode.content) ?? null;

                    if (node.modifiers.modifierNames.includes(modifier.nameNode.content) == false) {
                        node.modifiers.modifierNames.push(modifier.nameNode.content);
                    }

                    if (modifier.modifier != null) {
                        lastModifier = modifier.modifier;

                        if (node.modifierChain != null) {
                            node.modifierChain.lastManifestedModifier = modifier;
                        }
                    }
                }
            });

            node.modifierChain.lastModifier = lastModifier;

            if (node.modifiers.parameterModifiers.length > 0) {
                node.modifiers.hasMixedModifierStyles = true;
            }
        }

        if (node.runtimeNodes.length > 0) {
            node.runtimeNodes.forEach((runtimeNode) => {
                if (runtimeNode.modifierChain != null && runtimeNode.modifierChain.modifierChain.length > 0) {
                    let lastModifier: IModifier | null = null;

                    runtimeNode.modifierChain.modifierChain.forEach((modifier) => {
                        if (modifier.nameNode != null) {
                            modifier.modifier = ModifierManager.instance?.getModifier(modifier.nameNode.content) ?? null;
        
                            if (node.modifiers.modifierNames.includes(modifier.nameNode.content) == false) {
                                node.modifiers.modifierNames.push(modifier.nameNode.content);
                            }
        
                            if (modifier.modifier != null) {
                                lastModifier = modifier.modifier;
        
                                if (node.modifierChain != null) {
                                    node.modifierChain.lastManifestedModifier = modifier;
                                }
                            }
                        }
                    });
        
                    if (node.modifierChain != null) {
                        node.modifierChain.lastModifier = lastModifier;
                    }
        
                    if (node.modifiers.parameterModifiers.length > 0) {
                        node.modifiers.hasMixedModifierStyles = true;
                    }
                }
            });
        }

        const lastManifestModifier = node.modifiers.getLastManifestedModifier();

        if (lastManifestModifier != null) {
            if (lastManifestModifier.name == 'macro') {
                const macroName = node.modifiers.getLastManifestedModifierValue();

                node.manifestType = ModifierManager.instance?.getMacroManifestingType(macroName) ?? '';
            } else {
                node.manifestType = ModifierManager.instance?.getProbableReturnType(lastManifestModifier, node.isPaired()) ?? '';
            }
        }
    }
}
