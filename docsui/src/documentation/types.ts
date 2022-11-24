import type { IFieldDetails } from './structureTypes'

export interface IDocumentationSnippet {
    overview: string,
    snippet: string
}

export interface IDocumentationProperty {
    name: string,
    value: string,
    mono: boolean
}

export interface IDocumentationModifierParameter {
    name: string,
    description: string,
}

export interface IDocumentationModifier {
    name: string,
    description: string,
    docLink: string | null,
    acceptsTypes: string[],
    returnsTypes: string[],
    parameters: IDocumentationModifierParameter[]
}

export interface IInjectedField {
    name: string,
    type: string,
    field: IFieldDetails,
    description: string
}

export interface IFieldtypeDocumentationOverview {
    handle: string,
    field: IFieldDetails,
    injects: IInjectedField[],
    overviewProperties: IDocumentationProperty[],
    overviewSnippets: IDocumentationSnippet[],
    exampleSnippets: IDocumentationSnippet[],
    officialDocumentation: string | null,
    stringable: boolean,
    canBeTagPair: boolean,
    stringableReturns: string | null,
    rawReturns: string,
    augmentsTo: string,
    modifiers: IDocumentationModifier[]
}

export interface IDocumentationResult {
    resolved: boolean,
    documentation: IFieldtypeDocumentationOverview | null
}

export interface IDocumentationProvider {
    resolve(context: any): IDocumentationResult
}

const EmptyDocumentationResult: IDocumentationResult = {
    resolved: false,
    documentation: null
}

export { EmptyDocumentationResult };
