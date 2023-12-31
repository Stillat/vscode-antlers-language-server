import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver.js';
import { IProjectFields, ITaxonomiesFieldType } from '../../../projects/structuredFieldTypes/types.js';
import { AugmentationTypes } from '../augmentationTypes.js';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider.js';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider.js';
import { PipedTagSnippetProvider } from '../snippets/pipedTagSnippetProvider.js';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types.js';

export class TaxonomiesDocumentationProvider implements IDocumentationProvider {
    private injectsKeys: string[] = ['title', 'handle'];

    resolve(taxonomy: ITaxonomiesFieldType, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(taxonomy.type),
            injectedFields = KeysResolver.keysToInjectedField(this.injectsKeys),
            overviewProperties: IDocumentationProperty[] = [];


        let rawReturns: AugmentationTypes = AugmentationTypes.TaxonomyArray,
            augmentsTo: AugmentationTypes = AugmentationTypes.TaxonomyArray,
            overviewSnippets: IDocumentationSnippet[] = [],
            stringable = false;

        if (taxonomy.maxItems === 1) {
            rawReturns = AugmentationTypes.Taxonomy;
            augmentsTo = AugmentationTypes.Taxonomy;
            stringable = true;
            overviewSnippets.push(PipedTagSnippetProvider.generateSingle('taxonomy', 'from', taxonomy.handle));
            overviewSnippets = overviewSnippets.concat(NestedFieldsProvider.generate(taxonomy.handle, injectedFields));
        } else {
            overviewSnippets.push(PipedTagSnippetProvider.generate('taxonomy', 'from', taxonomy.handle));
            overviewSnippets = overviewSnippets.concat(NestedFieldsProvider.generateArrayFields(taxonomy.handle, injectedFields));
        }

        return {
            resolved: true,
            documentation: {
                handle: taxonomy.type,
                field: taxonomy,
                injects: injectedFields,
                stringable: true,
                rawReturns: rawReturns,
                augmentsTo: augmentsTo,
                canBeTagPair: true,
                exampleSnippets: [],
                overviewSnippets: overviewSnippets,
                officialDocumentation: docLink,
                overviewProperties: overviewProperties,
                stringableReturns: "The taxonomy's handle",
                modifiers: []
            }
        };
    }
}