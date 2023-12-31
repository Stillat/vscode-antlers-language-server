import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver.js';
import { IProjectFields, ISelectFieldType } from '../../../projects/structuredFieldTypes/types.js';
import { AugmentationTypes } from '../augmentationTypes.js';
import { ForeachProvider } from '../providers/foreachProvider.js';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider.js';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider.js';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types.js';

export class SelectDocumentationProvider implements IDocumentationProvider {
    resolve(context: ISelectFieldType, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(context.type),
            keys = ['value', 'label', 'key'],
            injectedFields = KeysResolver.keysToInjectedField(keys),
            overviewProperties: IDocumentationProperty[] = [];


        let rawReturns: AugmentationTypes = AugmentationTypes.String,
            augmentsTo: AugmentationTypes = AugmentationTypes.LabeledValueArray,
            overviewSnippets: IDocumentationSnippet[] = [];;

        if (context.multiple !== true) {
            rawReturns = AugmentationTypes.String;
            augmentsTo = AugmentationTypes.LabeledValue;
            overviewSnippets = NestedFieldsProvider.generate(context.handle, injectedFields);
            overviewSnippets.push(ForeachProvider.generate(context.handle));
        } else {
            overviewSnippets = NestedFieldsProvider.generateArrayFields(context.handle, injectedFields);
        }

        return {
            resolved: true,
            documentation: {
                handle: context.type,
                field: context,
                injects: injectedFields,
                stringable: true,
                rawReturns: rawReturns,
                augmentsTo: augmentsTo,
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