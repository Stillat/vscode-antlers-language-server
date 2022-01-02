import { IAntlersParameter, IAntlersTag } from '../../antlers/tagManager';
import TagManager from '../../antlers/tagManagerInstance';
import { GlobalFeatureConfiguration } from '../../featureConfiguration';
import { trimLeft } from '../../utils/strings';
import { AntlersError, ErrrorLevel } from '../errors/antlersError';
import { AntlersErrorCodes } from '../errors/antlersErrorCodes';
import { AntlersNode } from '../nodes/abstractNode';

interface IValidationResult {
    isValid: boolean;
    message: string;
}

export class ParameterValidator {

    private static validateInteger(string: string): IValidationResult {
        if (parseInt(string).toString() !== string) {
            return {
                isValid: false,
                message: '"' + string + '" is not a valid integer.',
            };
        }

        return {
            isValid: true,
            message: "",
        };
    }

    private static validateBoolean(string: string): IValidationResult {
        if (string == "true" || string == "false") {
            return {
                isValid: true,
                message: "",
            };
        }

        return {
            isValid: false,
            message: '"' + string + '" is not a valid value. Expecting true/false.',
        };
    }

    static validateParameters(node: AntlersNode) {
        if (node.isTagNode && TagManager.instance?.isKnownTag(node.runtimeName())) {
            const tagReference = TagManager.instance?.findTag(
                node.runtimeName()
            ) as IAntlersTag;

            if (node.hasParameters) {
                for (let p = 0; p < node.parameters.length; p++) {
                    const paramToAnalyze = node.parameters[p];
                    let registeredParam: IAntlersParameter | null = null,
                        attemptedToResolve = false,
                        paramName = paramToAnalyze.name.trim();

                    paramName = trimLeft(paramName, ":");

                    // TagManager.getParameter(node.name, paramToAnalyze.name);
                    if (
                        TagManager.instance?.canResolveDynamicParameter(node.runtimeName()) &&
                        typeof tagReference.resolveDynamicParameter !== "undefined" &&
                        tagReference.resolveDynamicParameter != null
                    ) {
                        registeredParam = tagReference.resolveDynamicParameter(
                            node,
                            paramName
                        );
                        attemptedToResolve = true;
                    } else {
                        registeredParam = TagManager.instance?.getParameter(
                            node.runtimeName(),
                            paramName
                        );
                    }

                    if (attemptedToResolve && registeredParam == null) {
                        registeredParam = TagManager.instance?.getParameter(
                            node.runtimeName(),
                            paramName
                        );
                    }

                    if (registeredParam == null) {
                        if (GlobalFeatureConfiguration.warnUnknownParameters) {
                            let suggestionSuffix = "";

                            if (tagReference.suggestAlternativeParams != null) {
                                const alternatives =
                                    tagReference.suggestAlternativeParams(paramName);

                                if (alternatives.length == 1) {
                                    suggestionSuffix =
                                        '. Did you mean "' + alternatives[0] + '"?';
                                } else if (alternatives.length > 1) {
                                    suggestionSuffix =
                                        ". Try one of the following: " + alternatives.join(", ");
                                }
                            }

                            const errorMessage = 'Unknown parameter name: "' + paramName + '"' + suggestionSuffix;

                            node.pushError(AntlersError.makeSyntaxError(
                                AntlersErrorCodes.LINT_UNKNOWN_PARAMETER,
                                node,
                                errorMessage,
                                ErrrorLevel.Warning
                            ));
                        }
                    } else {
                        if (registeredParam.validate != null) {
                            const paramResults = registeredParam.validate(node, paramToAnalyze);

                            if (paramResults.length > 0) {
                                paramResults.forEach((error) => {
                                    node.pushError(AntlersError.makeSyntaxError(
                                        AntlersErrorCodes.LINT_GENERAL_INVALID_PARAMETER_CONTENTS,
                                        paramToAnalyze,
                                        error.message,
                                        ErrrorLevel.Warning
                                    ));
                                });
                            }
                        } else {
							if (paramToAnalyze.hasInterpolations()) {
								continue;
							}

                            for (let q = 0; q < registeredParam.expectsTypes.length; q++) {
                                const curTypeToCheck = registeredParam.expectsTypes[q];

                                if (curTypeToCheck == 'integer') {
                                    const result = this.validateInteger(paramToAnalyze.value);

                                    if (!result.isValid) {
                                        node.pushError(AntlersError.makeSyntaxError(
                                            AntlersErrorCodes.LINT_PARAMETER_CONTENT_INVALID_INTEGER,
                                            paramToAnalyze,
                                            result.message,
                                            ErrrorLevel.Warning
                                        ));
                                    }
                                } else if (curTypeToCheck == 'boolean') {
                                    const result = this.validateBoolean(paramToAnalyze.value);

                                    if (registeredParam.name == 'paginate') {
                                        if (paramToAnalyze.value == 'true' || paramToAnalyze.value == 'false') {
                                            continue;
                                        } else {
                                            if (parseInt(paramToAnalyze.value).toString() != paramToAnalyze.value) {
                                                const message = 'Unexpected "' + paramToAnalyze.value + '". Expecting a numeric value, or true/false.';

                                                node.pushError(AntlersError.makeSyntaxError(
                                                    AntlersErrorCodes.LINT_PAGINATE_INVALID_VALUE,
                                                    paramToAnalyze,
                                                    message,
                                                    ErrrorLevel.Error
                                                ));
                                            }
                                        }
                                    } else {
                                        if (!result.isValid) {
                                            node.pushError(AntlersError.makeSyntaxError(
                                                AntlersErrorCodes.LINT_PARAMETER_CONTENT_INVALID_BOOLEAN,
                                                paramToAnalyze,
                                                result.message,
                                                ErrrorLevel.Warning
                                            ));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}