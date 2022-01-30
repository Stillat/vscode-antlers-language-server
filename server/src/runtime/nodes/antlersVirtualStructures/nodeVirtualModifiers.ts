import ModifierManager from '../../../antlers/modifierManager';
import { IModifier } from "../../../antlers/modifierTypes";
import { AbstractNode, ParameterNode, AntlersNode } from '../abstractNode';
import { Range } from '../position';

export class NodeVirtualModifiers {
    private node: AbstractNode;
    public parameterModifiers: ParameterNode[] = [];
    public hasMixedModifierStyles = false;
    public modifierNames: string[] = [];

    constructor(node: AbstractNode) {
        this.node = node;
    }

    private isPaired(): boolean {
        if (this.node instanceof AntlersNode) {
            return this.node.isPaired();
        }

        return false;
    }

    /**
     * Attempts to locate the value of a modifier by name.
     * 
     * Modifiers present within the node's modifier chain will be given preference.
     * If a match is not found within the chain, the node's parameters will be searched.
     * 
     * @param modifierName 
     * @returns 
     */
    getModifierValue(modifierName: string): string | null {
        if (this.node.modifierChain != null && this.node.modifierChain.modifierChain.length > 0) {

            for (let i = 0; i < this.node.modifierChain.modifierChain.length; i++) {
                const thisModifier = this.node.modifierChain.modifierChain[i];

                if (thisModifier.nameNode?.name == modifierName) {
                    if (thisModifier.valueNodes.length > 0) {
                        return thisModifier.valueNodes[0].content;
                    }

                    return '';
                }
            }
        }

        if (this.hasParameterModifiers()) {
            for (let i = 0; i < this.parameterModifiers.length; i++) {
                const thisModifier = this.parameterModifiers[i];

                if (thisModifier.name == modifierName) {
                    return thisModifier.value;
                }
            }
        }

        return null;
    }

    getModifierRange(modifierName: string): Range | null {
        if (this.node.modifierChain != null && this.node.modifierChain.modifierChain.length > 0) {

            for (let i = 0; i < this.node.modifierChain.modifierChain.length; i++) {
                const thisModifier = this.node.modifierChain.modifierChain[i];

                if (thisModifier.nameNode?.name == modifierName) {
                    if (thisModifier.valueNodes.length > 0) {
                        return {
                            start: thisModifier.startPosition,
                            end: thisModifier.endPosition
                        };
                    }

                    return null;
                }
            }
        }

        if (this.hasParameterModifiers()) {
            for (let i = 0; i < this.parameterModifiers.length; i++) {
                const thisModifier = this.parameterModifiers[i];

                if (thisModifier.name == modifierName) {
                    if (thisModifier.namePosition != null && thisModifier.valuePosition != null) {
                        return {
                            start: thisModifier.namePosition.start,
                            end: thisModifier.valuePosition.end
                        };
                    }
                }
            }
        }

        return null;
    }

    getLastManifestedModifierRuntimeType(): string {
        if (
            this.node.modifierChain != null &&
            this.node.modifierChain.modifierChain.length > 0 &&
            this.node.modifierChain.lastManifestedModifier != null
        ) {
            if (
                this.node.modifierChain.lastManifestedModifier.parameters.length > 0
            ) {
                if (this.node.modifierChain.lastManifestedModifier.modifier != null && ModifierManager.instance != null) {
                    const tModifier = this.node.modifierChain.lastManifestedModifier.modifier as IModifier;

                    return ModifierManager.instance.getProbableReturnType(tModifier, this.isPaired());
                }
            }

            return "*";
        }

        if (this.parameterModifiers.length > 0) {
            const pModifiers = this.parameterModifiers.reverse();

            for (let i = 0; i < pModifiers.length; i++) {
                if (pModifiers[i].modifier != null && ModifierManager.instance != null) {
                    const tModifier = pModifiers[i].modifier as IModifier;

                    return ModifierManager.instance.getProbableReturnType(tModifier, this.isPaired());
                }
            }
        }

        return "*";
    }

    getLastManifestedModifierValue(): string {
        if (
            this.node.modifierChain != null &&
            this.node.modifierChain.modifierChain.length > 0 &&
            this.node.modifierChain.lastManifestedModifier != null
        ) {
            if (
                this.node.modifierChain.lastManifestedModifier.parameters.length > 0
            ) {
                return this.node.modifierChain.lastManifestedModifier.parameters[0]
                    .value;
            }

            return "";
        }

        if (this.parameterModifiers.length > 0) {
            const pModifiers = this.parameterModifiers.reverse();

            for (let i = 0; i < pModifiers.length; i++) {
                if (pModifiers[i].modifier != null) {
                    return pModifiers[i].value;
                }
            }
        }

        return "";
    }

    getLastManifestedModifier(): IModifier | null {
        if (
            this.node.modifierChain != null &&
            this.node.modifierChain.modifierChain.length > 0 &&
            this.node.modifierChain.lastModifier != null
        ) {
            return this.node.modifierChain.lastModifier;
        }

        if (this.parameterModifiers.length > 0) {
            const pModifiers = this.parameterModifiers.reverse();

            for (let i = 0; i < pModifiers.length; i++) {
                if (pModifiers[i].modifier != null) {
                    return pModifiers[i].modifier;
                }
            }
        }

        return null;
    }

    hasModifiers(): boolean {
        if (
            this.node.modifierChain == null ||
            this.node.modifierChain.modifierChain.length == 0
        ) {
            if (this.parameterModifiers.length > 0) {
                return true;
            }

            return false;
        }

        return true;
    }

    hasParameterModifiers() {
        return this.parameterModifiers.length > 0;
    }

    hasShorthandModifiers() {
        if (this.node.modifierChain != null && this.node.modifierChain.modifierChain.length > 0) {
            return true;
        }

        return false;
    }

    hasModifier(modifierName: string): boolean {
        return this.modifierNames.includes(modifierName);
    }
}
