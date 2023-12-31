import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver.js';
import { IArrayFieldType, IProjectFields } from '../../../projects/structuredFieldTypes/types.js';
import { AugmentationTypes } from '../augmentationTypes.js';
import { EvenOddProvider } from '../providers/evenOddProvider.js';
import { ForeachProvider } from '../providers/foreachProvider.js';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider.js';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider.js';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types.js';

export class ArrayDocumentationProvider implements IDocumentationProvider {
    resolve(array: IArrayFieldType, currentProject: IProjectFields): IDocumentationResult {
        const keys = KeysResolver.getKeys(array),
            docLink = OfficialDocumentationLinkProvider.getDocLink(array.type),
            injectedFields = KeysResolver.keysToInjectedField(keys),
            overviewProperties: IDocumentationProperty[] = [],
            overviewSnippets: IDocumentationSnippet[] = NestedFieldsProvider.generate(array.handle, injectedFields);

        if (array.mode == 'keyed') {
            overviewSnippets.push(ForeachProvider.generate(array.handle));
        } else {
            EvenOddProvider.generate(array.handle).forEach((snippet) => overviewSnippets.push(snippet));
        }

        overviewProperties.push({
            mono: false,
            name: 'Mode',
            value: array.mode
        });

        return {
            resolved: true,
            documentation: {
                handle: array.type,
                field: array,
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