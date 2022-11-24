import { fetchDynamic, IFieldDetails, IProjectFields } from '../../projects/structuredFieldTypes/types'
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
    const snippets: IDocumentationSnippet[] = [],
        defaultValue = fetchDynamic<string|null>(field, 'default', null),
        isRequired = field.validate.includes('required');

    if (defaultValue === null || isRequired === false) {
        snippets.push({
            overview: `Using ${field.handle} in an operation`,
            snippet: `{{# Use null coalescence to account for a possible null value. #}}
{{ _result = (${field.handle} ?? 0) + 1; }}`
        });
    } else {
        const checkDefault = defaultValue as any;
        if (isNaN(checkDefault)) {
            snippets.push({
                overview: `Using ${field.handle} in an operation`,
                snippet: `{{#
    This field has a non-numeric default value of '${defaultValue}',
    which may cause issues with operations and comparisons.
#}}
{{ _result = ${field.handle} + 1; }}`
            });
        } else {
            snippets.push({
                overview: `Using ${field.handle} in an operation`,
                snippet: `{{ _result = ${field.handle} + 1; }}`
            });
        }
    }

    

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
    const snippets:IDocumentationSnippet[] = [];

    snippets.push({
        overview: `Using the ${field.handle} field in a condition`,
        snippet: `{{ if ${field.handle} }}

{{ /if }}`
    });

    snippets.push({
        overview: `Using the ${field.handle} field in a ternary expression`,
        snippet: `{{ ${field.handle} ? 'true' : 'false' }}`
    });

    snippets.push({
        overview: `Using the ${field.handle} field with the Gatekeeper operator to conditionally render a partial`,
        snippet: `{{ ${field.handle} ?= {partial:partial/name} }}`
    });

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
            overviewSnippets: snippets,
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
