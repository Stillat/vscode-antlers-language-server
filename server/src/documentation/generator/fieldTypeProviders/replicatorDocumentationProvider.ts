import { IProjectFields, IReplicatorFieldType } from '../../../projects/structuredFieldTypes/types.js';
import { AugmentationTypes } from '../augmentationTypes.js';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider.js';
import { SetsSnippetProvider } from '../snippets/setsSnippetProvider.js';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet, IInjectedField } from '../types.js';

export class ReplicatorDocumentationProvider implements IDocumentationProvider {
    resolve(replicator: IReplicatorFieldType, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(replicator.type),
            injectedFields: IInjectedField[] = [],
            overviewProperties: IDocumentationProperty[] = [],
            overviewSnippets: IDocumentationSnippet[] = SetsSnippetProvider.generate(replicator.handle, replicator.sets);

        return {
            resolved: true,
            documentation: {
                handle: replicator.type,
                field: replicator,
                injects: injectedFields,
                stringable: false,
                rawReturns: AugmentationTypes.Array,
                augmentsTo: AugmentationTypes.Array,
                canBeTagPair: true,
                exampleSnippets: [],
                overviewSnippets: overviewSnippets,
                officialDocumentation: docLink,
                overviewProperties: overviewProperties,
                stringableReturns: null,
                modifiers: []
            }
        };
    }
}