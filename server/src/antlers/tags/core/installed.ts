import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { IComposerPackage } from '../../../composer/lockFileParser';
import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag, ICompletionResult } from '../../tagManager';

const InstalledTag: IAntlersTag = {
	tagName: 'installed',
	hideFromCompletions: false,
	requiresClose: true,
	injectParentScope: false,
	allowsContentClose: false,
	allowsArbitraryParameters: true,
	parameters: [],
	resolveCompletionItems: (params: ISuggestionRequest) : ICompletionResult => {
		if (params.project != null) {
			const projectPackages = params.project.getComposerPackages(),
				packageCompletions:CompletionItem[] = [];

			projectPackages.forEach((composerPackage:IComposerPackage, packageName: string) => {
				packageCompletions.push({
					label: composerPackage.name,
					kind: CompletionItemKind.Text
				});
			});
			
			return exclusiveResult(packageCompletions);
		}

		return EmptyCompletionResult;
	}
};

export {InstalledTag};
