import { AntlersError, ErrrorLevel } from '../../runtime/errors/antlersError';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes';
import { AntlersNode, ParameterNode, ModifierNode } from '../../runtime/nodes/abstractNode';
import { IDiagnosticsHandler } from "../diagnosticsHandler";

const ModifierRuntimeTypeHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const issues: AntlersError[] = [];

        if (node.modifiers == null) {
            return issues;
        }

        if (node.modifiers.hasParameterModifiers()) {
            let lastModifier: ParameterNode | null = null;

            for (let i = 0; i < node.modifiers.parameterModifiers.length; i++) {
                const thisModifier = node.modifiers.parameterModifiers[i];

                if (lastModifier == null) {
                    lastModifier = thisModifier;
                    continue;
                }

                if (lastModifier != null && lastModifier.modifier != null && thisModifier.modifier != null) {
                    if (
                        lastModifier.modifier.returnsType.includes("*") ||
                        thisModifier.modifier.acceptsType.includes("*")
                    ) {
                        continue;
                    } else {
                        const lastModifierReturns = lastModifier.modifier.returnsType;
                        let recievedGuess = "void",
                            expectedGuess = "void";

                        const typeOverlap = thisModifier.modifier.acceptsType.some((r) =>
                            lastModifierReturns.includes(r)
                        );

                        if (lastModifierReturns.length > 0) {
                            recievedGuess =
                                lastModifierReturns[lastModifierReturns.length - 1];
                        }

                        if (thisModifier.modifier.acceptsType.length > 0) {
                            expectedGuess = thisModifier.modifier.acceptsType[0];
                        }

                        if (!typeOverlap) {
                            issues.push(AntlersError.makeSyntaxError(
                                AntlersErrorCodes.LINT_MODIFIER_UNEXPECTED_TYPE,
                                thisModifier,
                                "Unexpected type supplied to modifier " + thisModifier.name + ". Expected " + expectedGuess + " got " + recievedGuess + ".",
                                ErrrorLevel.Warning
                            ));
                            break;
                        }
                    }
                }
            }
        }

        if (node.modifiers.hasShorthandModifiers() && node.modifierChain != null
        ) {
            let lastModifier: ModifierNode | null = null;

            for (let i = 0; i < node.modifierChain.modifierChain.length; i++) {
                const thisModifier = node.modifierChain.modifierChain[i];

                if (lastModifier == null) {
                    lastModifier = thisModifier;
                    continue;
                }

                if (
                    lastModifier != null &&
                    lastModifier.modifier != null &&
                    thisModifier.modifier != null
                ) {
                    if (
                        lastModifier.modifier.returnsType.includes("*") ||
                        thisModifier.modifier.acceptsType.includes("*")
                    ) {
                        continue;
                    } else {
                        const lastModifierReturns = lastModifier.modifier.returnsType;
                        let recievedGuess = "void",
                            expectedGuess = "void";

                        const typeOverlap = thisModifier.modifier.acceptsType.some((r) =>
                            lastModifierReturns.includes(r)
                        );

                        if (lastModifierReturns.length > 0) {
                            recievedGuess =
                                lastModifierReturns[lastModifierReturns.length - 1];
                        }

                        if (thisModifier.modifier.acceptsType.length > 0) {
                            expectedGuess = thisModifier.modifier.acceptsType[0];
                        }

                        if (!typeOverlap) {
                            issues.push(AntlersError.makeSyntaxError(
                                AntlersErrorCodes.LINT_MODIFIER_UNEXPECTED_TYPE,
                                thisModifier,
                                "Unexpected type supplied to modifier " + thisModifier.name + ". Expected " + expectedGuess + " got " + recievedGuess + ".",
                                ErrrorLevel.Warning
                            ));
                            break;
                        }
                    }
                }
            }
        }

        return issues;
    },
};

export default ModifierRuntimeTypeHandler;
