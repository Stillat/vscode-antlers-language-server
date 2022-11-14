import { IProjectFields, IReplicatorFieldType } from '../../../projects/structuredFieldTypes/types';
import { AugmentationTypes } from '../augmentationTypes';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider';
import { SetsSnippetProvider } from '../snippets/setsSnippetProvider';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet, IInjectedField } from '../types';

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