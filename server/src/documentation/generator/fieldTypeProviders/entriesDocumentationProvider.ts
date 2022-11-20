import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver';
import { IEntriesFieldType, IFieldDetails, IProjectFields } from '../../../projects/structuredFieldTypes/types';
import { AugmentationTypes } from '../augmentationTypes';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet, IInjectedField } from '../types';
import { GeneralQueryBuilderDocumentationProvider } from './generalQueryBuilderDocumentationProvider';

export class EntriesDocumentationProvider implements IDocumentationProvider {
    resolve(context: IEntriesFieldType, currentProject: IProjectFields): IDocumentationResult {
        if (context.maxItems !== 1) {
            return (new GeneralQueryBuilderDocumentationProvider()).resolve(context, currentProject);
        }

        const docLink = OfficialDocumentationLinkProvider.getDocLink(context.type),
            overviewProperties: IDocumentationProperty[] = [];

        let injectedFields: IInjectedField[] = [],
            overviewSnippets: IDocumentationSnippet[] = [];

        if (context.collections != null && context.collections.length > 0) {
            let fields: IFieldDetails[] = [];

            currentProject.collections.forEach((collection) => {
                if (context.collections?.includes(collection.collection)) {
                    if (typeof collection.allFields != 'undefined' && collection.allFields != null) {
                        fields = fields.concat(collection.allFields);
                    }
                }
            });

            injectedFields = KeysResolver.fieldsToInjectedFields(fields);
            overviewSnippets = NestedFieldsProvider.generate(context.handle, injectedFields);
        }



        return {
            resolved: true,
            documentation: {
                handle: context.type,
                field: context,
                injects: injectedFields,
                stringable: false,
                rawReturns: AugmentationTypes.Entry,
                augmentsTo: AugmentationTypes.Entry,
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