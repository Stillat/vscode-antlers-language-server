import { DiagnosticSeverity } from "vscode-languageserver";
import { AntlersError } from '../runtime/errors/antlersError';

export interface IPosition {
    line: number;
    offset: number;
    index: number;
}

export interface IAntlersBraceState {
    line: number;
    offset: number;
    isOpen: boolean;
    isDouble: boolean;
}

export interface ISpecialResolverResults {
    context: any;
    issues: AntlersError[] | null;
}

export interface ITagExtraction {
    tagName: string;
    isClosingTag: boolean;
    startLine: number;
    endLine: number;
    startOffset: number;
    endOffset: number;
    contents: string;
}

export interface IErrorLocation {
    /**
     * The start line of the error.
     */
    startLine: number;
    /**
     * The end line of the error.
     */
    endLine: number;
    /**
     * The start offset of the error (relative to the start line).
     */
    startPos: number;
    /**
     * The end offset of the error (relative to the end line).
     */
    endPos: number;
    /**
     * The severity of the error.
     */
    severity: DiagnosticSeverity;
}

export interface IReportableError extends IErrorLocation {
    /**
     * The message to display to the end-user.
     */
    message: string;
}

export interface IUnmatchedBrace {
    startLine: number;
    endLine: number;
    startPos: number;
    endPos: number;
    foundChar: string | null;
}

export type IUnknownCollection = IErrorLocation;

export interface ISeekResult {
    found: boolean;
    content: string;
    offset: number;
}

export interface IFoundLineOffset {
    offset: number;
    line: number;
}

export interface IFoundOffset {
    offset: number;
    index: number;
    char: string | null;
}

export interface ICollectionContext {
    line: number;
    startPosition: number;
    endPosition: number;
    collectionNames: string[];
    scopeName: string | null;
    isScoped: boolean;
    isPaginated: boolean;
    includeCollections: string[];
    excludeCollections: string[];
    isStartOfScope: boolean;
    isAliased: boolean;
    aliasName: string | null;
}
