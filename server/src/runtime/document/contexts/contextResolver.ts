import { AntlersNode, AbstractNode, ParserFailNode, VariableNode } from '../../nodes/abstractNode';
import { Position } from '../../nodes/position';
import { AntlersDocument } from '../antlersDocument';
import { FeatureContextResolver } from '../featureContextResolver';
import { GeneralContext } from './generalContext';
import { IdentifierContext } from './identifierContext';
import { ModifierContext } from './modifierContext';
import { ParameterContext } from './parameterContext';
import { CursorContext, PositionContext } from './positionContext';
import { VariableContext } from './variableContext';

export class ContextResolver {

    private static resolveIdentifierContext(position: Position, node: AntlersNode): IdentifierContext {
        const identifierContext = new IdentifierContext();

        if (node.nameMethodPartStartsOn != null) {
            if (position.char < node.nameMethodPartStartsOn.char) {
                identifierContext.inTagPart = true;
                identifierContext.inMethodPart = false;
            } else {
                identifierContext.inTagPart = false;
                identifierContext.inMethodPart = true;
            }
        } else {
            identifierContext.inMethodPart = false;
            identifierContext.inTagPart = true;
        }

        return identifierContext;
    }

    static resolveContext(position: Position | null, node: AbstractNode | null, document: AntlersDocument, isInterpolated = false, root: AbstractNode | null = null): PositionContext | null {
        if (node == null || position == null) {
            return null;
        }

        if (node instanceof ParserFailNode || node instanceof AntlersNode) {
            const cursorContext = new PositionContext();

            if (node.nameStartsOn != null && position.line == node.nameStartsOn.line) {
                let isInName = false;

                if (position.char >= node.nameStartsOn.char) {
                    isInName = true;
                }

                if (node.nameEndsOn != null) {
                    if (position.char > node.nameEndsOn.char) {
                        isInName = false;
                    }
                }

                if (isInName) {
                    cursorContext.isCursorInIdentifier = true;
                    cursorContext.identifierContext = ContextResolver.resolveIdentifierContext(position, node);
                }
            }

            node.addContext(cursorContext);

            if (root != null) {
                root.addContext(cursorContext);
            }

            cursorContext.interpolatedContext = isInterpolated;
            cursorContext.node = node;
            cursorContext.position = position;
            cursorContext.root = root;

            cursorContext.leftPunctuation = document.punctuationLeftAt(position);
            cursorContext.rightPunctuation = document.punctuationRightAt(position);

            cursorContext.leftChar = document.charLeftAt(position);
            cursorContext.rightChar = document.charRightAt(position);

            cursorContext.word = document.wordAt(position);
            cursorContext.char = document.charAt(position);
            cursorContext.leftWord = document.wordLeftAt(position);
            cursorContext.rightWord = document.wordRightAt(position);

            let foundParameterContext = false;

            if (node.parameters.length > 0) {
                for (let i = 0; i < node.parameters.length; i++) {
                    const thisParam = node.parameters[i];

                    if (thisParam.blockPosition != null && thisParam.blockPosition.start != null && thisParam.blockPosition.end != null) {
                        if (position.char > thisParam.blockPosition.start.char && position.char <= thisParam.blockPosition.end.char + 1 &&
                            position.line >= (thisParam.namePosition?.start?.line ?? thisParam.blockPosition.start.line) &&
                            position.line <= (thisParam.valuePosition?.end?.line ?? thisParam.blockPosition.end.line)) {
                            cursorContext.cursorContext = CursorContext.Parameter;
                            cursorContext.parameterContext = ParameterContext.resolveContext(position, thisParam);
                            cursorContext.isInParameter = true;
                            cursorContext.feature = thisParam;
                            foundParameterContext = true;
                            break;
                        }
                    }
                }
            }

            if (!foundParameterContext) {
                node.runtimeNodes.forEach((runtimeNode) => {
                    if (runtimeNode.startPosition != null && runtimeNode.endPosition != null) {
                        if (position.isWithin(runtimeNode.startPosition, runtimeNode.endPosition, 1)) {
                            cursorContext.feature = runtimeNode;
                        }
                    }
                });
            }

            // Check if the cursor is inside an interpolation region with the parameter.
            if (foundParameterContext) {
                if (node.interpolationRegions.size > 0) {
                    const regions = Array.from(node.interpolationRegions, ([name, region]) => region);

                    for (let j = 0; j < regions.length; j++) {
                        const interpolatedRegion = regions[j];

                        if (position.index >= interpolatedRegion.startOffset && position.index <= interpolatedRegion.endOffset) {
                            const interpolatedNode = node.getInterpolationNode(interpolatedRegion.varContent);

                            return ContextResolver.resolveContext(position, interpolatedNode, document, true, root);
                        }
                    }
                }
            }

            if (cursorContext.feature instanceof VariableNode && cursorContext.feature.isInterpolationReference && cursorContext.feature.parent != null &&
                cursorContext.feature.parent instanceof AntlersNode && cursorContext.feature.parent.processedInterpolationRegions.has(cursorContext.feature.name)) {
                return ContextResolver.resolveContext(position, cursorContext.feature.parent.getInterpolationNode(cursorContext.feature.name), document, true, root);
            }

            const isInModifier = FeatureContextResolver.isModifierLeftOfPosition(position, node.runtimeNodes);

            if (isInModifier) {
                cursorContext.cursorContext = CursorContext.Modifier;
                cursorContext.modifierContext = ModifierContext.resolveContext(position, node, cursorContext.feature, document);
            } else {
                if (!foundParameterContext) {
                    cursorContext.cursorContext = CursorContext.General;
                    cursorContext.generalContext = GeneralContext.resolveContext(position, node, cursorContext.feature);
                }
            }

            cursorContext.variableContext = VariableContext.resolveContext(position, node, cursorContext.feature, document);

            return cursorContext;
        }

        return null;
    }
}