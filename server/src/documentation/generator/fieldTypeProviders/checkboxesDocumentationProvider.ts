import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver.js';
import { ICheckboxesFieldType, IProjectFields } from '../../../projects/structuredFieldTypes/types.js';
import { AugmentationTypes } from '../augmentationTypes.js';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider.js';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider.js';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types.js';

export class CheckboxesDocumentationProvider implements IDocumentationProvider {
    resolve(checkboxes: ICheckboxesFieldType, currentProject: IProjectFields): IDocumentationResult {
        const keys = ['key', 'value', 'label'],
            docLink = OfficialDocumentationLinkProvider.getDocLink(checkboxes.type),
            injectedFields = KeysResolver.keysToInjectedField(keys),
            overviewProperties: IDocumentationProperty[] = [],
            overviewSnippets: IDocumentationSnippet[] = NestedFieldsProvider.generateArrayFields(checkboxes.handle, injectedFields);

        return {
            resolved: true,
            documentation: {
                handle: checkboxes.type,
                field: checkboxes,
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