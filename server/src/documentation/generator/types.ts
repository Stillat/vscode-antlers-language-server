import { IFieldDetails, IProjectFields } from '../../projects/structuredFieldTypes/types'
import { AugmentationTypes } from './augmentationTypes'
import { OfficialDocumentationLinkProvider } from './providers/officialDocumentationLinkProvider'

export interface IDocumentationSnippet {
    overview: string,
    snippet: string
}

export interface IDocumentationProperty {
    name: string,
    value: string,
    mono: boolean
}

export interface IInjectedField {
    name: string,
    type: string,
    field: IFieldDetails,
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

export interface IDocumentationResult {
    resolved: boolean,
    documentation: IFieldtypeDocumentationOverview | null
}

export interface IDocumentationProvider {
    resolve(context: any, project: IProjectFields | null): IDocumentationResult
}

export function stringDocumentationResult(field: IFieldDetails): IDocumentationResult {
    return {
        resolved: true,
        documentation: {
            handle: field.type,
            field: field,
            injects: [],
            stringable: true,
            rawReturns: AugmentationTypes.String,
            augmentsTo: AugmentationTypes.String,
            canBeTagPair: false,
            exampleSnippets: [],
            overviewProperties: [],
            overviewSnippets: [],
            modifiers: [],
            officialDocumentation: OfficialDocumentationLinkProvider.getDocLink(field.type),
            stringableReturns: "The field's value"
        }
    }
}

export function numericDocumentationResult(field: IFieldDetails): IDocumentationResult {
    const snippets: IDocumentationSnippet[] = [];

    snippets.push({
        overview: `Using ${field.handle} in an operation`,
        snippet: `{{ _result = ${field.handle} + 1; }}`
    });

    snippets.push({
        overview: `Using ${field.handle} in a condition`,
        snippet: `{{ if ${field.handle} > 0 }}

{{ /if }}`
    });

    return {
        resolved: true,
        documentation: {
            handle: field.type,
            field: field,
            injects: [],
            stringable: true,
            rawReturns: AugmentationTypes.Number,
            augmentsTo: AugmentationTypes.Number,
            canBeTagPair: false,
            exampleSnippets: [],
            overviewProperties: [],
            overviewSnippets: snippets,
            modifiers: [],
            officialDocumentation: OfficialDocumentationLinkProvider.getDocLink(field.type),
            stringableReturns: "The field's value"
        }
    }
}

export function booleanDocumentationResult(field: IFieldDetails): IDocumentationResult {
    return {
        resolved: true,
        documentation: {
            handle: field.type,
            field: field,
            injects: [],
            stringable: true,
            rawReturns: AugmentationTypes.Boolean,
            augmentsTo: AugmentationTypes.Boolean,
            canBeTagPair: false,
            exampleSnippets: [],
            overviewProperties: [],
            overviewSnippets: [],
            modifiers: [],
            officialDocumentation: OfficialDocumentationLinkProvider.getDocLink(field.type),
            stringableReturns: "The field's value"
        }
    }
}

const EmptyDocumentationResult: IDocumentationResult = {
    resolved: false,
    documentation: null
}

export { EmptyDocumentationResult };
