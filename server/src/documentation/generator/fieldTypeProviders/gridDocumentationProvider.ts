import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver.js';
import { IGridFieldType, IProjectFields } from '../../../projects/structuredFieldTypes/types.js';
import { AugmentationTypes } from '../augmentationTypes.js';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider.js';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider.js';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types.js';

export class GridDocumentationProvider implements IDocumentationProvider {
    resolve(grid: IGridFieldType, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(grid.type),
            injectedFields = KeysResolver.fieldsToInjectedFields(grid.fields),
            overviewProperties: IDocumentationProperty[] = [],
            overviewSnippets: IDocumentationSnippet[] = NestedFieldsProvider.generate(grid.handle, injectedFields);

        return {
            resolved: true,
            documentation: {
                handle: grid.type,
                field: grid,
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