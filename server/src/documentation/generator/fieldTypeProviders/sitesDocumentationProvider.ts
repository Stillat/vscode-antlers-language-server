import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver.js';
import { IProjectFields, ISitesFieldType } from '../../../projects/structuredFieldTypes/types.js';
import { AugmentationTypes } from '../augmentationTypes.js';
import { Faker } from '../faker.js';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider.js';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider.js';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet, IInjectedField } from '../types.js';

export class SitesDocumentationProvider implements IDocumentationProvider {
    private injectsKeys: string[] = ['handle', 'name', 'lang', 'locale', 'short_locale', 'url', 'direction'];

    resolve(site: ISitesFieldType, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(site.type),
            injectedFields: IInjectedField[] = KeysResolver.keysToInjectedField(this.injectsKeys).concat([Faker.injectedArrayField('attributes', '')]),
            overviewProperties: IDocumentationProperty[] = [];


        let rawReturns: AugmentationTypes = AugmentationTypes.SiteArray,
            augmentsTo: AugmentationTypes = AugmentationTypes.SiteArray,
            overviewSnippets: IDocumentationSnippet[] = [],
            stringable = false;

        if (site.maxItems === 1) {
            rawReturns = AugmentationTypes.Site;
            augmentsTo = AugmentationTypes.Site;
            stringable = true;
            overviewSnippets = NestedFieldsProvider.generate(site.handle, injectedFields);
        } else {
            overviewSnippets = NestedFieldsProvider.generateArrayFields(site.handle, injectedFields);
        }

        return {
            resolved: true,
            documentation: {
                handle: site.type,
                field: site,
                injects: injectedFields,
                stringable: true,
                rawReturns: rawReturns,
                augmentsTo: augmentsTo,
                canBeTagPair: true,
                exampleSnippets: [],
                overviewSnippets: overviewSnippets,
                officialDocumentation: docLink,
                overviewProperties: overviewProperties,
                stringableReturns: "The site's handle",
                modifiers: []
            }
        };
    }
}