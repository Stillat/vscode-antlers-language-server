import { CompletionItem, CompletionItemKind, MarkupKind, ParameterStructures } from 'vscode-languageserver';
import { DocumentDetailsManager } from '../../../idehelper/documentDetailsManager';
import { IEnvironmentHelper } from '../../../idehelper/parser';
import { currentStructure, IView } from '../../../projects/statamicProject';
import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { IAntlersParameter, IAntlersTag, resultList } from '../../tagManager';
import { returnDynamicParameter } from '../dynamicParameterResolver';

const Partial: IAntlersTag = {
	tagName: 'partial',
	hideFromCompletions: false,
	injectParentScope: false,
	allowsArbitraryParameters: true,
	parameters: [
		{
			isRequired: false,
			name: "src",
			description: "The name of the partial view",
			acceptsVariableInterpolation: false,
			allowsVariableReference: false,
			aliases: [],
			expectsTypes: ['string'],
			isDynamic: false
		}
	],
	requiresClose: false,
	allowsContentClose: true,
	resolveDynamicParameter: returnDynamicParameter,
	resovleParameterCompletionItems: (parameter:IAntlersParameter, params:ISuggestionRequest) => {
		if (parameter.isDynamic) {
			if (params.currentSymbol != null && params.currentSymbol.name == 'partial' && params.currentSymbol.methodName != null) {
				if (params.currentSymbol.methodName.trim().length > 0) {
					if (currentStructure != null) {
						const projectView = currentStructure.findPartial(params.currentSymbol.methodName);

						if (projectView != null && projectView.varReferenceNames.has(parameter.name)) {
							const viewDataRef = projectView.varReferenceNames.get(parameter.name) as string;

							if (projectView.viewDataDocument != null && typeof projectView.viewDataDocument[viewDataRef] !== 'undefined') {
								const viewDataItems = Object.keys(projectView.viewDataDocument[viewDataRef]) as string[];

								return resultList(viewDataItems);
							}
						}
					}
				}
			}
		}

		return null;
	},
	resolveCompletionItems: (params: ISuggestionRequest) => {
		const items: CompletionItem[] = [];

		if (params.leftChar == '"' && params.leftWord == ':src="') {
			return {
				items: [],
				analyzeDefaults: true,
				isExclusiveResult: false
			};
		}

		if (((params.leftWord == 'partial' || params.leftWord == '/partial') && params.leftChar == ':') ||
			(params.leftWord == 'src="' && params.leftChar == '"')) {
			const partials = params.project.getPartials();

			partials.forEach((view: IView) => {
				if (DocumentDetailsManager.hasDetails(view.documentUri)) {
					const partialDetails = DocumentDetailsManager.documentDetails.get(view.documentUri) as IEnvironmentHelper;

					items.push({
						label: partialDetails.documentName + '(' + view.relativeDisplayName + ')',
						insertText: view.relativeDisplayName,
						detail: partialDetails.documentName,
						documentation: {
							kind: MarkupKind.Markdown,
							value: partialDetails.documentDescription
						},
						kind: CompletionItemKind.File
					});
				} else {
					items.push({
						label: view.relativeDisplayName,
						kind: CompletionItemKind.File
					});
				}
			});

			return {
				analyzeDefaults: false,
				isExclusiveResult: true,
				items
			};
		}

		return {
			analyzeDefaults: true,
			isExclusiveResult: false,
			items: []
		};
	}
};

export default Partial;
