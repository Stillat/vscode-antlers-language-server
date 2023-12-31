import ModifierManager from '../../../antlers/modifierManager.js';
import { ModifierChainNode, ModifierNode, AbstractNode, AntlersNode, ModifierNameNode } from '../../nodes/abstractNode.js';
import { Position } from '../../nodes/position.js';
import { DocumentParser } from '../../parser/documentParser.js';
import { AntlersDocument } from '../antlersDocument.js';

export class ModifierContext {
    public modifierChain: ModifierChainNode | null = null;
    public activeModifier: ModifierNode | null = null;
    public name = '';
    public inModifierName = false;
    public inModifierParameter = false;
    public valueCount = 0;
    public activeValueIndex = -1;
    public activeValue: AbstractNode | null = null;

    static resolveContext(position: Position, node: AntlersNode, feature: AbstractNode | null, document: AntlersDocument) {
        const parser = node.getParser() as DocumentParser,
            context = new ModifierContext(),
            chains = parser.getLanguageParser().getCreatedModifierChains();

        let modifier: ModifierNode | null = null;

        for (let i = 0; i < chains.length; i++) {
            const chain = chains[i];

            if (position.isWithin(chain.startPosition, chain.endPosition, 2)) {
                for (let j = 0; j < chain.modifierChain.length; j++) {
                    const thisModifier = chain.modifierChain[j];

                    if (position.isWithin(thisModifier.startPosition, thisModifier.endPosition, 2)) {
                        modifier = thisModifier;
                        break;
                    }
                }

                if (modifier != null) {
                    break;
                }
            }
        }

        if (modifier == null && feature instanceof ModifierNameNode) {
            if (document.getDocumentParser().getLanguageParser().hasModifierConstruct(feature)) {
                modifier = document.getDocumentParser().getLanguageParser().getModifierConstruct(feature);
            }
        }

        const modLeftWord = document.wordLeftAt(position);

        if (modifier == null && modLeftWord != null && ModifierManager.instance?.hasModifier(modLeftWord)) {
            if (node.modifierChain != null && node.modifierChain.modifierChain.length > 0) {
                for (let i = 0; i < node.modifierChain.modifierChain.length; i++) {
                    const curModifierChainItem = node.modifierChain.modifierChain[i];

                    if (curModifierChainItem.modifier != null && curModifierChainItem.modifier.name == modLeftWord) {
                        modifier = curModifierChainItem;
                        break;
                    }
                }
            }
        }

        if (modifier != null) {
            context.activeModifier = modifier;

            if (modifier.nameNode != null) {
                context.name = modifier.nameNode.name;
            }

            if (modifier.nameNode != null && position.isWithin(modifier.nameNode.startPosition, modifier.nameNode.endPosition, 1)) {
                context.inModifierName = true;
            }

            if (modifier.methodStyleArguments != null) {
                // Method syntax: {{ title | ensure_right('value') }}
                context.valueCount = modifier.methodStyleArguments.args.length;

                if (! context.inModifierName) {
                    for (let i = 0; i < modifier.methodStyleArguments.args.length; i++) {
                        const argValue = modifier.methodStyleArguments.args[i];

                        if (position.isWithin(argValue.startPosition, argValue.endPosition, 1)) {
                            context.activeValueIndex = i;
                            context.activeValue = argValue;
                        }
                    }

                    if (context.activeValueIndex === -1 && position.isWithin(modifier.methodStyleArguments.startPosition, modifier.methodStyleArguments.endPosition)) {
                        context.valueCount += 1;
                        context.activeValueIndex = context.valueCount - 1;
                    }
                }
            } else {
                // Legacy syntax: {{ title | ensure_right:value }}
                context.valueCount = modifier.valueNodes.length;

                 if (! context.inModifierName) {
                    for (let i = 0; i < modifier.valueNodes.length; i++) {
                        const value = modifier.valueNodes[i];

                        if (position.isWithin(value.startPosition, value.endPosition, 1)) {
                            context.activeValueIndex = i;
                            context.activeValue = value;
                            break;
                        }
                    }
                }
            }
        }

        return context;
    }
}