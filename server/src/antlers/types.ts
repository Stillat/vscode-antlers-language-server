import { DiagnosticSeverity } from 'vscode-languageserver';
import { ISymbolModifierCollection } from './modifierAnalyzer';
import { AntlersParser } from './parser';
import { IScopeVariable, Scope } from './scope/engine';
import { IParameterAttribute, IRuntimeVariableType } from './tagManager';

export interface IPosition {
	line: number,
	offset: number,
	index: number
}

export interface IAntlersBraceState {
	line: number,
	offset: number,
	isOpen: boolean,
	isDouble: boolean
}

export interface ISpecialResolverResults {
	context: any,
	issues: IReportableError[] | null
}

export interface ITagExtraction {
	tagName: string,
	isClosingTag: boolean,
	startLine: number;
	endLine: number;
	startOffset: number;
	endOffset: number;
	contents: string;
}

export interface ISymbol {
	/**
	 * An internal identifier for the symbol.
	 * 
	 * This identifier is regenerated on each parser pass,
	 * and must not be relied upon to be consistent.
	 */
	id: string,
	index: number,
	/**
	 * Indicates if the symbol represents an Antlers comment.
	 */
	isComment: boolean,
	/**
	 * The parsed tag name.
	 */
	tagPart: string,
	/**
	 * The current scope the symbol belongs to, if available.
	 */
	currentScope: Scope | null,
	/**
	 * The scope variable attached to the symbol, if available.
	 */
	scopeVariable: IScopeVariable | null,
	/**
	 * The inferred data type the symbol is representing.
	 */
	sourceType: string,
	/**
	 * The inferred runtime type the symbol is representing.
	 * 
	 * This will differ from the sourceType property if
	 * a modifier has changed the symbol's data type.
	 */
	manifestType: string,
	/**
	 * Indicates if the symbol must have a closing tag.
	 */
	mustClose: boolean | null,
	/**
	 * A list of all associated user-defined parameters.
	 */
	parameterCache: IParameterAttribute[] | null,
	/**
	 * A list of all discovered parameter names.
	 */
	existingParamNames: string[],
	/**
	 * An adjusted tag name, with prefixes removed.
	 */
	name: string,
	/**
	 * The fully qualified tag name, composed of the analyzed name and method name.
	 */
	runtimeName: string,
	/**
	 * The parsed method name.
	 */
	methodName: string | null,
	/**
	 * The full parsed content of the symbol.
	 */
	content: string,
	/**
	 * The parsed content that includes all known parameters.
	 */
	parameterContent: string,
	/**
	 * The offset at which parameter content starts.
	 */
	parameterContentStart: number,
	/**
	 * The line at which parameter content starts.
	 */
	parameterContentStartLine: number,
	/**
	 * Indicates if the current symbol represents a closing tag.
	 */
	isClosingTag: boolean,
	/**
	 * The reference to the opening tag counterpart, if available.
	 */
	belongsTo: ISymbol | null,
	/**
	 * The reference to the closing tag counterpart, if available.
	 */
	isClosedBy: ISymbol | null,
	/**
	 * The runtime variable type instance, if available.
	 */
	runtimeType: IRuntimeVariableType | null,
	/**
	 * A collection of all parsed modifiers, if available.
	 */
	modifiers: ISymbolModifierCollection | null,
	/**
	 * The "name" given to the current scope, if any.
	 */
	scopeName: string | null,
	/**
	 * Indicates if the symbol can be resolved to a known Antlers tag.
	 */
	isTag: boolean,
	/**
	 * The start line of the symbol.
	 */
	startLine: number,
	/**
	 * The end line of the symbol.
	 */
	endLine: number,
	/**
	 * The start offset of the symbol.
	 */
	startOffset: number,
	/**
	 * The end offset of the symbol.
	 */
	endOffset: number,
	/**
	 * An internal flag indicating if the symbol content contains a modifier separator.
	 */
	hasModifierSeparator: boolean,
	/**
	 * The offset of the internal modifier separator.
	 */
	modifierOffset: number | null,
	/**
	 * A reference to any internal specialized symbol representations.
	 */
	reference: any | null,
	/**
	 * A reference to the owner Antlers parser.
	 */
	parserInstance: AntlersParser | null,
	/**
	 * Indicates if the symbol was created while parsing a variable interpolation range.
	 */
	isInterpolationSymbol: boolean
}

const EmptySymbol: ISymbol = {
	id: '',
	index: 0,
	isComment: false,
	tagPart: '',
	methodName: '',
	currentScope: null,
	scopeVariable: null,
	sourceType: '',
	manifestType: '',
	mustClose: false,
	parameterCache: null,
	existingParamNames: [],
	name: '',
	runtimeName: '',
	content: '',
	parameterContent: '',
	parameterContentStart: 0,
	parameterContentStartLine: 0,
	isClosingTag: false,
	belongsTo: null,
	isClosedBy: null,
	runtimeType: null,
	modifiers: null,
	scopeName: null,
	isTag: false,
	startLine: 0,
	endLine: 0,
	startOffset: 0,
	endOffset: 0,
	hasModifierSeparator: false,
	modifierOffset: null,
	reference: null,
	parserInstance: null,
	isInterpolationSymbol: false
};

export { EmptySymbol };

export function createSymbol(startLine: number, endLine: number, startOffset: number, endOffset: number, content: string): ISymbol {
	return {
		id: '',
		index: 0,
		isComment: false,
		tagPart: '',
		methodName: '',
		currentScope: null,
		scopeVariable: null,
		sourceType: '',
		manifestType: '',
		mustClose: false,
		parameterCache: null,
		existingParamNames: [],
		name: '',
		runtimeName: '',
		content: '',
		parameterContent: content,
		parameterContentStart: 0,
		parameterContentStartLine: 0,
		isClosingTag: false,
		belongsTo: null,
		isClosedBy: null,
		runtimeType: null,
		modifiers: null,
		scopeName: null,
		isTag: false,
		startLine: startLine,
		endLine: endLine,
		startOffset: startOffset,
		endOffset: endOffset,
		hasModifierSeparator: false,
		modifierOffset: null,
		reference: null,
		parserInstance: null,
		isInterpolationSymbol: false
	};
}

export function getMethodNameValue(symbol: ISymbol): string {
	let valueToReturn = '';

	if (symbol.methodName != null && symbol.methodName.trim().length > 0) {
		valueToReturn = symbol.methodName;
	}

	return valueToReturn;
}

export function hasParamAndMatches(symbol: ISymbol, paramName: string, expected: string): boolean {
	const param = getParameter(paramName, symbol);

	if (param != null) {
		return param.value == expected;
	}

	return false;
}

export function getParameterFromLists(names: string[], symbol: ISymbol): IParameterAttribute | null {
	for (let i = 0; i < names.length; i++) {
		const paramValue = getParameter(names[i], symbol);

		if (typeof paramValue !== 'undefined' && paramValue !== null) {
			return paramValue;
		}
	}

	return null;
}

export function getParameter(name: string, symbol: ISymbol): IParameterAttribute | null {
	if (symbol.parameterCache != null) {
		for (let i = 0; i < symbol.parameterCache.length; i++) {
			if (symbol.parameterCache[i].name == name) {
				return symbol.parameterCache[i];
			}
		}
	}

	return null;
}

export interface IErrorLocation {
	/**
	 * The start line of the error.
	 */
	startLine: number,
	/**
	 * The end line of the error.
	 */
	endLine: number,
	/**
	 * The start offset of the error (relative to the start line).
	 */
	startPos: number,
	/**
	 * The end offset of the error (relative to the end line).
	 */
	endPos: number,
	/**
	 * The severity of the error.
	 */
	severity: DiagnosticSeverity
}

export interface IReportableError extends IErrorLocation {
	/**
	 * The message to display to the end-user.
	 */
	message: string
}

export interface IUnmatchedBrace {
	startLine: number,
	endLine: number,
	startPos: number,
	endPos: number,
	foundChar: string | null
}

export type IUnknownCollection = IErrorLocation

export interface ISeekResult {
	found: boolean,
	content: string,
	offset: number
}

export interface IFoundLineOffset {
	offset: number,
	line: number
}

export interface IFoundOffset {
	offset: number,
	index: number,
	char: string | null
}

export interface ICollectionContext {
	line: number,
	startPosition: number,
	endPosition: number,
	collectionNames: string[],
	scopeName: string | null,
	isScoped: boolean,
	isPaginated: boolean,
	includeCollections: string[],
	excludeCollections: string[],
	isStartOfScope: boolean,
	isAliased: boolean,
	aliasName: string | null
}
