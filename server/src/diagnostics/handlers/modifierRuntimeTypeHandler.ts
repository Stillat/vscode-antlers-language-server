import { AntlersError, ErrorLevel } from '../../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes.js';
import { AntlersNode, ParameterNode, ModifierNode, AbstractNode } from '../../runtime/nodes/abstractNode.js';
import { IDiagnosticsHandler } from "../diagnosticsHandler.js";

const ModifierRuntimeTypeHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const issues: AntlersError[] = [];

        if (node.modifiers == null) {
            return issues;
        }

        const reportedNodes:string[] = [];

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
                                ErrorLevel.Warning
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
                        lastModifier = thisModifier;
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
                            if (thisModifier.refId != null && !reportedNodes.includes(thisModifier.refId)) {
                                issues.push(AntlersError.makeSyntaxError(
                                    AntlersErrorCodes.LINT_MODIFIER_UNEXPECTED_TYPE,
                                    thisModifier,
                                    "Unexpected type supplied to modifier " + thisModifier.name + ". Expected " + expectedGuess + " got " + recievedGuess + ".",
                                    ErrorLevel.Warning
                                ));
                                reportedNodes.push(thisModifier.refId);
                            }
                            break;
                        }
                        lastModifier = thisModifier;
                    }
                }
            }
        }

        if (node.runtimeNodes != null && node.runtimeNodes.length > 0) {
            for (let j = 0; j < node.runtimeNodes.length; j++) {
                const checkRuntimeNode = node.runtimeNodes[j] as AbstractNode;

                let lastModifier: ModifierNode | null = null;

                if (checkRuntimeNode.modifierChain == null) {
                    continue;
                }

                for (let i = 0; i < checkRuntimeNode.modifierChain.modifierChain.length; i++) {
                    const thisModifier = checkRuntimeNode.modifierChain.modifierChain[i];

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
                            lastModifier = thisModifier;
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
                                if (thisModifier.refId != null) {
                                    if (reportedNodes.includes(thisModifier.refId) == false ) {
                                        issues.push(AntlersError.makeSyntaxError(
                                            AntlersErrorCodes.LINT_MODIFIER_UNEXPECTED_TYPE,
                                            thisModifier,
                                            "Unexpected type supplied to modifier " + thisModifier.name + ". Expected " + expectedGuess + " got " + recievedGuess + ".",
                                            ErrorLevel.Warning
                                        ));
                                        reportedNodes.push(thisModifier.refId);
                                    }
                                }
                                break;
                            }
                            lastModifier = thisModifier;
                        }
                    }
                }
            }
        }

        return issues;
    },
};

export default ModifierRuntimeTypeHandler;
