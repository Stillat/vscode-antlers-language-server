import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver';
import { IProjectFields, IUserGroupsFieldType } from '../../../projects/structuredFieldTypes/types';
import { AugmentationTypes } from '../augmentationTypes';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider';
import { PipedTagSnippetProvider } from '../snippets/pipedTagSnippetProvider';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types';

export class UserGroupsDocumentationProvider implements IDocumentationProvider {
    private injectsKeys: string[] = ['title', 'handle'];

    resolve(group: IUserGroupsFieldType, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(group.type),
            injectedFields = KeysResolver.keysToInjectedField(this.injectsKeys),
            overviewProperties: IDocumentationProperty[] = [];


        let rawReturns: AugmentationTypes = AugmentationTypes.UserGroupArray,
            augmentsTo: AugmentationTypes = AugmentationTypes.UserGroupArray,
            overviewSnippets: IDocumentationSnippet[] = [],
            stringable = false;

        if (group.maxItems === 1) {
            rawReturns = AugmentationTypes.UserGroup;
            augmentsTo = AugmentationTypes.UserGroup;
            stringable = true;
            overviewSnippets.push(PipedTagSnippetProvider.generateSingle('user:in', 'group', group.handle));
            overviewSnippets.push(PipedTagSnippetProvider.generateSingleCondition('user:in', 'group', group.handle));
            overviewSnippets = overviewSnippets.concat(NestedFieldsProvider.generate(group.handle, injectedFields));
        } else {
            overviewSnippets.push(PipedTagSnippetProvider.generate('user:in', 'group', group.handle));
            overviewSnippets.push(PipedTagSnippetProvider.generateCondition('user:in', 'group', group.handle));
            overviewSnippets = overviewSnippets.concat(NestedFieldsProvider.generateArrayFields(group.handle, injectedFields));
        }

        return {
            resolved: true,
            documentation: {
                handle: group.type,
                field: group,
                injects: injectedFields,
                stringable: true,
                rawReturns: rawReturns,
                augmentsTo: augmentsTo,
                canBeTagPair: true,
                exampleSnippets: [],
                overviewSnippets: overviewSnippets,
                officialDocumentation: docLink,
                overviewProperties: overviewProperties,
                stringableReturns: "The user group's handle",
                modifiers: []
            }
        };
    }
}