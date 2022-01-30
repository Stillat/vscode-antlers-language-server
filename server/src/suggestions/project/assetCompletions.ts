import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { IProjectDetailsProvider } from '../../projects/projectDetailsProvider';

export function getAllAssetCompletions(project: IProjectDetailsProvider): CompletionItem[] {
    const items: CompletionItem[] = [],
        containers = project.getUniqueAssetNames();

    for (let i = 0; i < containers.length; i++) {
        items.push({ label: containers[i], kind: CompletionItemKind.Field });
    }

    return items;
}
