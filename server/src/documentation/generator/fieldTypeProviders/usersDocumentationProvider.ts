import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver.js';
import { IParsedBlueprint, IProjectFields, IUsersFieldType } from '../../../projects/structuredFieldTypes/types.js';
import { AugmentationTypes } from '../augmentationTypes.js';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider.js';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider.js';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet, IInjectedField } from '../types.js';
import { GeneralQueryBuilderDocumentationProvider } from './generalQueryBuilderDocumentationProvider.js';

export class UsersDocumentationProvider implements IDocumentationProvider {
    resolve(context: IUsersFieldType, currentProject: IProjectFields): IDocumentationResult {
        if (context.maxItems !== 1) {
            return (new GeneralQueryBuilderDocumentationProvider()).resolve(context, currentProject);
        }

        let userBlueprint: IParsedBlueprint | null = null;

        for (let i = 0; i < currentProject.general.length; i++) {
            if (currentProject.general[i].handle == 'user') {
                userBlueprint = currentProject.general[i];
                break;
            }
        }

        const docLink = OfficialDocumentationLinkProvider.getDocLink(context.type),
            injectedFields: IInjectedField[] = KeysResolver.fieldsToInjectedFields(userBlueprint?.allFields ?? []),
            overviewProperties: IDocumentationProperty[] = [],
            overviewSnippets: IDocumentationSnippet[] = NestedFieldsProvider.generate(context.handle, injectedFields);

        return {
            resolved: true,
            documentation: {
                handle: context.type,
                field: context,
                injects: injectedFields,
                stringable: false,
                rawReturns: AugmentationTypes.User,
                augmentsTo: AugmentationTypes.User,
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