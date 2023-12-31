import { IFieldDetails, IProjectFields } from '../../../projects/structuredFieldTypes/types.js';
import { AugmentationTypes } from '../augmentationTypes.js';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider.js';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types.js';

export class GeneralQueryBuilderDocumentationProvider implements IDocumentationProvider {
    resolve(context: IFieldDetails, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(context.type),
            overviewProperties: IDocumentationProperty[] = [],
            overviewSnippets: IDocumentationSnippet[] = [];

        overviewSnippets.push({
            overview: `Using modifiers on the ${context.handle} field`,
            snippet: `{{ ${context.handle} as="${context.handle}_alias" }}
    {{ ${context.handle}_alias | reverse }}

    {{ /${context.handle}_alias }}
{{ /${context.handle} }}`
        });

        return {
            resolved: true,
            documentation: {
                handle: context.type,
                field: context,
                injects: [],
                stringable: false,
                rawReturns: AugmentationTypes.Builder,
                augmentsTo: AugmentationTypes.Builder,
                canBeTagPair: true,
                exampleSnippets: [],
                overviewSnippets: overviewSnippets,
                officialDocumentation: docLink,
                overviewProperties: overviewProperties,
                stringableReturns: '',
                modifiers: []
            }
        };
    }
}