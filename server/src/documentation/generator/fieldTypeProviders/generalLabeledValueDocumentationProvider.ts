import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver.js';
import { IFieldDetails, IProjectFields } from '../../../projects/structuredFieldTypes/types.js';
import { AugmentationTypes } from '../augmentationTypes.js';
import { ForeachProvider } from '../providers/foreachProvider.js';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider.js';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider.js';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types.js';

export class LabeledValueDocumentationProvider implements IDocumentationProvider {
    resolve(context: IFieldDetails, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(context.type),
            keys = ['value', 'label', 'key'],
            injectedFields = KeysResolver.keysToInjectedField(keys),
            overviewProperties: IDocumentationProperty[] = [],
            overviewSnippets: IDocumentationSnippet[] = NestedFieldsProvider.generate(context.handle, injectedFields);

        overviewSnippets.push(ForeachProvider.generate(context.handle));

        return {
            resolved: true,
            documentation: {
                handle: context.type,
                field: context,
                injects: injectedFields,
                stringable: true,
                rawReturns: AugmentationTypes.String,
                augmentsTo: AugmentationTypes.LabeledValue,
                canBeTagPair: true,
                exampleSnippets: [],
                overviewSnippets: overviewSnippets,
                officialDocumentation: docLink,
                overviewProperties: overviewProperties,
                stringableReturns: "The field's value",
                modifiers: []
            }
        };
    }
}