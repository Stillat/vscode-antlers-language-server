import { DiagnosticSeverity } from 'vscode-languageserver-types';
import { ISymbolModifier } from '../antlers/modifierAnalyzer';
import { IParameterAttribute } from '../antlers/tagManager';
import { IReportableError, ISymbol } from '../antlers/types';

export function parameterError(message: string, symbol: ISymbol, parameter: IParameterAttribute): IReportableError {
	return {
		endLine: symbol.startLine,
		startLine: symbol.startLine,
		endPos: parameter.endOffset,
		startPos: parameter.contentStartsAt,
		message: message,
		severity: DiagnosticSeverity.Error
	};
}

export function modifierWarning(message: string, modifier: ISymbolModifier): IReportableError {
	return {
		endLine: modifier.line,
		startLine: modifier.line,
		endPos: modifier.endOffset,
		startPos: modifier.startOffset,
		message: message,
		severity: DiagnosticSeverity.Warning
	};
}

export function modifierError(message: string, modifier: ISymbolModifier): IReportableError {
	return {
		endLine: modifier.line,
		startLine: modifier.line,
		endPos: modifier.endOffset - 1,
		startPos: modifier.startOffset - 1,
		message: message,
		severity: DiagnosticSeverity.Error
	};
}


export function symbolWarning(message: string, symbol: ISymbol): IReportableError {
	return {
		endLine: symbol.startLine,
		endPos: symbol.endOffset,
		message: message,
		severity: DiagnosticSeverity.Warning,
		startLine: symbol.startLine,
		startPos: symbol.startOffset
	};
}

export function symbolError(message: string, symbol: ISymbol): IReportableError {
	return {
		endLine: symbol.startLine,
		endPos: symbol.endOffset,
		message: message,
		severity: DiagnosticSeverity.Error,
		startLine: symbol.startLine,
		startPos: symbol.startOffset
	};
}
