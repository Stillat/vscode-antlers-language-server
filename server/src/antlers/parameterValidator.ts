import { DiagnosticSeverity } from 'vscode-languageserver-types';
import { trimLeft } from '../utils/strings';
import { IAntlersParameter, IAntlersTag, IParameterAttribute, TagManager } from './tagManager';
import { IReportableError, ISymbol } from './types';

interface IValidationResult {
	isValid: boolean,
	message: string
}

function validateInteger(string: string): IValidationResult {
	if (parseInt(string).toString() !== string) {
		return {
			isValid: false,
			message: '"' + string + '" is not a valid integer.'
		};
	}

	return {
		isValid: true, message: ''
	};
}

function validateBoolean(string: string): IValidationResult {
	if (string == 'true' || string == 'false') {
		return {
			isValid: true, message: ''
		};
	}

	return {
		isValid: false,
		message: '"' + string + '" is not a valid value. Expecting true/false.'
	};
}

export function validateSymbolParameters(symbols: ISymbol[]): IReportableError[] {
	let errors: IReportableError[] = [];

	for (let i = 0; i < symbols.length; i++) {
		const curSymb = symbols[i];

		if (curSymb.isTag && TagManager.isKnownTag(curSymb.runtimeName)) {
			const tagReference = TagManager.findTag(curSymb.runtimeName) as IAntlersTag;

			if (curSymb.parameterCache != null && curSymb.parameterCache.length > 0) {
				for (let p = 0; p < curSymb.parameterCache.length; p++) {
					const paramToAnalyze = curSymb.parameterCache[p];
					let registeredParam: IAntlersParameter | null = null,
						attemptedToResolve = false,
						paramName = paramToAnalyze.name.trim();

					paramName = trimLeft(paramName, ':');

					// TagManager.getParameter(curSymb.name, paramToAnalyze.name);
					if (TagManager.canResolveDynamicParameter(curSymb.runtimeName) && typeof tagReference.resolveDynamicParameter !== 'undefined' && tagReference.resolveDynamicParameter != null) {
						registeredParam = tagReference.resolveDynamicParameter(curSymb, paramName);
						attemptedToResolve = true;
					} else {
						registeredParam = TagManager.getParameter(curSymb.runtimeName, paramName);
					}

					if (attemptedToResolve && registeredParam == null) {
						registeredParam = TagManager.getParameter(curSymb.runtimeName, paramName);
					}

					if (registeredParam == null) {
						let suggestionSuffix = '';

						if (tagReference.suggestAlternativeParams != null) {
							const alternatives = tagReference.suggestAlternativeParams(paramName);

							if (alternatives.length == 1) {
								suggestionSuffix = '. Did you mean "' + alternatives[0] + '"?';
							} else if (alternatives.length > 1) {
								suggestionSuffix = '. Try one of the following: ' + alternatives.join(', ');
							}
						}

						errors.push({
							startLine: curSymb.startLine,
							endLine: curSymb.startLine,
							endPos: paramToAnalyze.endOffset,
							startPos: paramToAnalyze.startOffset,
							severity: DiagnosticSeverity.Warning,
							message: 'Unknown parameter name: "' + paramName + '"' + suggestionSuffix
						});
					} else {
						if (registeredParam.validate != null) {
							const paramResults = registeredParam.validate(curSymb, paramToAnalyze);

							if (paramResults.length > 0) {
								errors = errors.concat(paramResults);
							}
						} else {
							for (let q = 0; q < registeredParam.expectsTypes.length; q++) {
								const curTypeToCheck = registeredParam.expectsTypes[q];
								let isValid: IValidationResult = {
									isValid: true, message: ''
								};

								switch (curTypeToCheck) {
									case 'integer':
										isValid = validateInteger(paramToAnalyze.value);
										break;
									case 'boolean':
										isValid = validateBoolean(paramToAnalyze.value);
										break;
								}

								if (isValid.isValid == false) {
									errors.push({
										startLine: curSymb.startLine,
										endLine: curSymb.startLine,
										endPos: paramToAnalyze.endOffset,
										startPos: paramToAnalyze.startOffset,
										severity: DiagnosticSeverity.Error,
										message: isValid.message
									});
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
