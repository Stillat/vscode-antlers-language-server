import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver';
import { ICollectionsFieldType, IProjectFields } from '../../../projects/structuredFieldTypes/types';
import { AugmentationTypes } from '../augmentationTypes';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider';
import { PipedTagSnippetProvider } from '../snippets/pipedTagSnippetProvider';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types';

export class CollectionsDocumentationProvider implements IDocumentationProvider {
    private injectsKeys: string[] = ['title', 'handle'];

    resolve(collection: ICollectionsFieldType, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(collection.type),
            injectedFields = KeysResolver.keysToInjectedField(this.injectsKeys),
            overviewProperties: IDocumentationProperty[] = [];


        let rawReturns: AugmentationTypes = AugmentationTypes.CollectionArray,
            augmentsTo: AugmentationTypes = AugmentationTypes.CollectionArray,
            overviewSnippets: IDocumentationSnippet[] = [],
            stringable = false;

        if (collection.maxItems === 1) {
            rawReturns = AugmentationTypes.Collection;
            augmentsTo = AugmentationTypes.Collection;
            stringable = true;
            overviewSnippets.push(PipedTagSnippetProvider.generateSingle('collection', 'from', collection.handle));
            overviewSnippets = overviewSnippets.concat(NestedFieldsProvider.generate(collection.handle, injectedFields));
        } else {
            overviewSnippets.push(PipedTagSnippetProvider.generate('collection', 'from', collection.handle));
            overviewSnippets = overviewSnippets.concat(NestedFieldsProvider.generateArrayFields(collection.handle, injectedFields));
        }

        return {
            resolved: true,
            documentation: {
                handle: collection.type,
                field: collection,
                injects: injectedFields,
                stringable: true,
                rawReturns: rawReturns,
                augmentsTo: augmentsTo,
                canBeTagPair: true,
                exampleSnippets: [],
                overviewSnippets: overviewSnippets,
                officialDocumentation: docLink,
                overviewProperties: overviewProperties,
                stringableReturns: "The collection's handle",
                modifiers: []
            }
        };
    }
}