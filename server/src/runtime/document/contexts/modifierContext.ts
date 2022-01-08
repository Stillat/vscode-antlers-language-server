import { ModifierChainNode, ModifierNode, AbstractNode, AntlersNode, ModifierNameNode } from '../../nodes/abstractNode';
import { Position } from '../../nodes/position';
import { DocumentParser } from '../../parser/documentParser';
import { LanguageParser } from '../../parser/languageParser';
import { AntlersDocument } from '../antlersDocument';

export class ModifierContext {
    public modifierChain: ModifierChainNode | null = null;
    public activeModifier: ModifierNode | null = null;
    public name = '';
    public inModifierName = false;
    public inModifierParameter = false;
    public valueCount = 0;
    public activeValueIndex = -1;
    public activeValue: AbstractNode | null = null;

    static resolveContext(position: Position, node: AntlersNode, feature: AbstractNode | null, document:AntlersDocument) {
        const parser = node.getParser() as DocumentParser,
            context = new ModifierContext(),
            chains = parser.getLanguageParser().getCreatedModifierChains();

        let modifier: ModifierNode | null = null;

        for (let i = 0; i < chains.length; i++) {
            const chain = chains[i];

            if (position.isWithin(chain.startPosition, chain.endPosition)) {
                for (let j = 0; j < chain.modifierChain.length; j++) {
                    const thisModifier = chain.modifierChain[j];

                    if (position.isWithin(thisModifier.startPosition, thisModifier.endPosition)) {
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

        if (modifier != null) {
            context.activeModifier = modifier;
            context.valueCount = modifier.valueNodes.length;

            if (modifier.nameNode != null) {
                context.name = modifier.nameNode.name;
            }

            if (modifier.nameNode != null && position.isWithin(modifier.nameNode.startPosition, modifier.nameNode.endPosition, 1)) {
                context.inModifierName = true;
            } else {
                for (let i = 0; i < modifier.valueNodes.length; i++) {
                    const value = modifier.valueNodes[i];

                    if (position.isWithin(value.startPosition, value.endPosition, 1)) {
                        context.activeValueIndex = i;
                        context.inModifierParameter = true;
                        context.activeValue = value;
                        break;
                    }
                }
            }
        }

        return context;
    }
}