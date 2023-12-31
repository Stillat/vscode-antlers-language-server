import { IAntlersParameter, IAntlersTag } from '../../antlers/tagManager.js';
import TagManager from '../../antlers/tagManagerInstance.js';
import { GlobalFeatureConfiguration } from '../../featureConfiguration.js';
import { trimLeft } from '../../utils/strings.js';
import { AntlersError, ErrorLevel } from '../errors/antlersError.js';
import { AntlersErrorCodes } from '../errors/antlersErrorCodes.js';
import { AntlersNode } from '../nodes/abstractNode.js';

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

    static validateParameters(node: AntlersNode): AntlersError[] {
        const errors: AntlersError[] = [];

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

                    if (paramToAnalyze.isVariableReference) {
                        continue;
                    }

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

                            errors.push(AntlersError.makeSyntaxError(
                                AntlersErrorCodes.LINT_UNKNOWN_PARAMETER,
                                node,
                                errorMessage,
                                ErrorLevel.Warning
                            ));
                        }
                    } else {
                        if (registeredParam.validate != null) {
                            const paramResults = registeredParam.validate(node, paramToAnalyze);

                            if (paramResults.length > 0) {
                                paramResults.forEach((error) => {
                                    errors.push(AntlersError.makeSyntaxError(
                                        AntlersErrorCodes.LINT_GENERAL_INVALID_PARAMETER_CONTENTS,
                                        paramToAnalyze,
                                        error.message,
                                        ErrorLevel.Warning
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
                                        errors.push(AntlersError.makeSyntaxError(
                                            AntlersErrorCodes.LINT_PARAMETER_CONTENT_INVALID_INTEGER,
                                            paramToAnalyze,
                                            result.message,
                                            ErrorLevel.Warning
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

                                                errors.push(AntlersError.makeSyntaxError(
                                                    AntlersErrorCodes.LINT_PAGINATE_INVALID_VALUE,
                                                    paramToAnalyze,
                                                    message,
                                                    ErrorLevel.Error
                                                ));
                                            }
                                        }
                                    } else {
                                        if (!result.isValid) {
                                            errors.push(AntlersError.makeSyntaxError(
                                                AntlersErrorCodes.LINT_PARAMETER_CONTENT_INVALID_BOOLEAN,
                                                paramToAnalyze,
                                                result.message,
                                                ErrorLevel.Warning
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

        return errors;
    }
}