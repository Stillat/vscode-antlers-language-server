import { IModifier } from '../../antlers/modifierTypes';
import { AntlersError, ErrrorLevel } from '../../runtime/errors/antlersError';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes';
import { AbstractNode, AntlersNode, ModifierNode, ParameterNode } from '../../runtime/nodes/abstractNode';
import { IDiagnosticsHandler } from '../diagnosticsHandler';

const DeprecatedModifierHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const issues: AntlersError[] = [];

        if (node.modifiers == null) { return issues; }

        const reportedNodes:string[] = [];

        if (node.modifiers.hasParameterModifiers()) {
            for (let i = 0; i < node.modifiers.parameterModifiers.length; i++) {
                const thisModifier = node.modifiers.parameterModifiers[i];

                if (thisModifier.refId != null && reportedNodes.includes(thisModifier.refId) == false && thisModifier.modifier != null && thisModifier.modifier.isDeprecated) {
                    issues.push(AntlersError.makeSyntaxError(
                        AntlersErrorCodes.LINT_DEPRECATED_MODIFIER,
                        node.modifiers.parameterModifiers[i],
                        getDeprecatedMessage(thisModifier.modifier),
                        ErrrorLevel.Warning
                    ));
                    reportedNodes.push(thisModifier.refId);
                }
            }
        }

        if (node.modifiers.hasShorthandModifiers() && node.modifierChain != null
        ) {
            for (let i = 0; i < node.modifierChain.modifierChain.length; i++) {
                const thisModifier = node.modifierChain.modifierChain[i];

                if (thisModifier.refId != null && reportedNodes.includes(thisModifier.refId) == false && thisModifier.modifier != null && thisModifier.modifier.isDeprecated) {
                    issues.push(AntlersError.makeSyntaxError(
                        AntlersErrorCodes.LINT_DEPRECATED_MODIFIER,
                        thisModifier,
                        getDeprecatedMessage(thisModifier.modifier),
                        ErrrorLevel.Warning
                    ));
                    reportedNodes.push(thisModifier.refId);
                }
            }
        }

        if (node.runtimeNodes != null && node.runtimeNodes.length > 0) {
            for (let j = 0; j < node.runtimeNodes.length; j++) {
                const checkRuntimeNode = node.runtimeNodes[j] as AbstractNode;

                if (checkRuntimeNode.modifierChain == null) {
                    continue;
                }

                for (let i = 0; i < checkRuntimeNode.modifierChain.modifierChain.length; i++) {
                    const thisModifier = checkRuntimeNode.modifierChain.modifierChain[i];

                    if (thisModifier.refId != null && reportedNodes.includes(thisModifier.refId) == false && thisModifier.modifier != null && thisModifier.modifier.isDeprecated) {
                        issues.push(AntlersError.makeSyntaxError(
                            AntlersErrorCodes.LINT_DEPRECATED_MODIFIER,
                            thisModifier,
                            getDeprecatedMessage(thisModifier.modifier),
                            ErrrorLevel.Warning
                        ));
                        reportedNodes.push(thisModifier.refId);
                    }
                }
            }
        }

        return issues;
    }
}

function getDeprecatedMessage(modifier: IModifier): string {
    if (modifier.getDeprecatedMessage != null) {
        return modifier.getDeprecatedMessage();
    }

    return `${modifier.name} is deprecated.`;
}

export default DeprecatedModifierHandler;
