import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { StatamicProject } from '../../projects/statamicProject';

export function getAllAssetCompletions(project: StatamicProject): CompletionItem[] {
	const items: CompletionItem[] = [],
		containers = project.getUniqueAssetNames();

	for (let i = 0; i < containers.length; i++) {
		items.push({ label: containers[i], kind: CompletionItemKind.Field });
	}

	return items;
}
