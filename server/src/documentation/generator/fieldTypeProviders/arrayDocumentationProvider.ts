import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver';
import { IArrayFieldType, IProjectFields } from '../../../projects/structuredFieldTypes/types';
import { AugmentationTypes } from '../augmentationTypes';
import { EvenOddProvider } from '../providers/evenOddProvider';
import { ForeachProvider } from '../providers/foreachProvider';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types';

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