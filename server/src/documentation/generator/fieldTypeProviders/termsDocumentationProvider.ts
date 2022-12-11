import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver';
import { IProjectFields, ITermsFieldType } from '../../../projects/structuredFieldTypes/types';
import { AugmentationTypes } from '../augmentationTypes';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types';

export class TermsDocumentationProvider implements IDocumentationProvider {
    private injectsKeys: string[] = ['api_url', 'edit_url', 'entries_count', 'id', 'is_term', 'locale',
        'permalink', 'slug', 'taxonomy', 'title', 'updated_at', 'updated_by', 'uri', 'url'];

    resolve(terms: ITermsFieldType, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(terms.type),
            injectedFields = KeysResolver.keysToInjectedField(this.injectsKeys),
            overviewProperties: IDocumentationProperty[] = [];


        let rawReturns: AugmentationTypes = AugmentationTypes.Builder,
            augmentsTo: AugmentationTypes = AugmentationTypes.Builder,
            overviewSnippets: IDocumentationSnippet[] = [],
            stringable = false;

        if (terms.maxItems === 1) {
            rawReturns = AugmentationTypes.Taxonomy;
            augmentsTo = AugmentationTypes.Taxonomy;
            stringable = true;
            overviewSnippets = overviewSnippets.concat(NestedFieldsProvider.generate(terms.handle, injectedFields));
        } else {
            overviewSnippets = overviewSnippets.concat(NestedFieldsProvider.generateArrayFields(terms.handle, injectedFields));
        }

        return {
            resolved: true,
            documentation: {
                handle: terms.type,
                field: terms,
                injects: injectedFields,
                stringable: false,
                rawReturns: rawReturns,
                augmentsTo: augmentsTo,
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