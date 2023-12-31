import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { IProjectDetailsProvider } from '../../../../projects/projectDetailsProvider.js';

export function getAllGroupSuggestionsn(project: IProjectDetailsProvider): CompletionItem[] {
    const items: CompletionItem[] = [],
        userGroups = project.getUniqueUserGroupNames();

    for (let i = 0; i < userGroups.length; i++) {
        items.push({
            label: userGroups[i],
            kind: CompletionItemKind.Field
        });
    }

    return items;
}

export function getAllRolesSuggestions(project: IProjectDetailsProvider): CompletionItem[] {
    const items: CompletionItem[] = [],
        userRoles = project.getUniqueUserRoleNames();

    for (let i = 0; i < userRoles.length; i++) {
        items.push({
            label: userRoles[i],
            kind: CompletionItemKind.Field
        });
    }

    return items;
}

export function makeUserGroupSuggestions(existingValues: string[], project: IProjectDetailsProvider): CompletionItem[] {
    const items: CompletionItem[] = [],
        userGroups = project.getUniqueUserGroupNames(),
        groupsToReturn = userGroups.filter(e => !existingValues.includes(e));

    for (let i = 0; i < groupsToReturn.length; i++) {
        items.push({
            label: groupsToReturn[i],
            kind: CompletionItemKind.Field
        });
    }

    return items;
}

export function makeUserRolesSuggestions(existingValues: string[], project: IProjectDetailsProvider): CompletionItem[] {
    const items: CompletionItem[] = [],
        userRoles = project.getUniqueUserRoleNames(),
        rolesToReturn = userRoles.filter(e => !existingValues.includes(e));

    for (let i = 0; i < rolesToReturn.length; i++) {
        items.push({
            label: rolesToReturn[i],
            kind: CompletionItemKind.Field
        });
    }

    return items;
}
