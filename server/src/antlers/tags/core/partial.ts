import { CompletionItem, CompletionItemKind, InsertTextFormat, MarkupKind, TextEdit } from 'vscode-languageserver';
import { Range } from 'vscode-languageserver-textdocument';
import { getViewName } from '../../../analyzers/partialAnalyzer';
import { getVariableNames } from '../../../analyzers/variableAnalyzer';
import { DocumentDetailsManager } from '../../../idehelper/documentDetailsManager';
import { IEnvironmentHelper } from '../../../idehelper/parser';
import { currentStructure, IView } from '../../../projects/statamicProject';
import { parserInstances } from '../../../session';
import { ISuggestionRequest } from '../../../suggestions/suggestionManager';
import { AntlersParser } from '../../parser';
import { IAntlersParameter, IAntlersTag, nonExclusiveResult, resultList } from '../../tagManager';
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
						const projectView = currentStructure.findRelativeView(params.currentSymbol.methodName);

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
			const partials = params.project.getViews();

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

			if (params.leftWord != 'src="') {
				items.push({
					label: 'exists',
					kind: CompletionItemKind.Text
				});
				items.push({
					label: 'if_exists',
					kind: CompletionItemKind.Text
				});
			}

			return {
				analyzeDefaults: false,
				isExclusiveResult: true,
				items
			};
		}

		if (params.currentSymbol != null && params.project != null) {
			const viewName = getViewName(params.currentSymbol);

			if (viewName != null && viewName.trim().length > 0) {
				const viewRef = params.project.findRelativeView(viewName);

				if (viewRef != null) {
					if (parserInstances.has(viewRef.documentUri)) {
						const docInstance = parserInstances.get(viewRef.documentUri) as AntlersParser;

						if (docInstance != null) {
							const symbols = docInstance.getSymbols(),
								variableNames = getVariableNames(symbols),
								addedNames:string[] = [];

							if (viewRef.varReferenceNames != null) {

								viewRef.varReferenceNames.forEach((val, varName) => {
									variableNames.push(varName);
								});
							}

							if (variableNames.length > 0) {
								const completionItems:CompletionItem[] = [];
								const range: Range = {
									start: {
										line: params.position.line,
										character: params.position.character - 0
									},
									end: params.position
								};

								variableNames.forEach((variableName: string) => {
									const paramSnippet = variableName + '="$1"';

									if (addedNames.includes(variableName)) {
										return;
									}

									addedNames.push(variableName);

									completionItems.push({
										label: variableName,
										kind: CompletionItemKind.Value,
										insertTextFormat: InsertTextFormat.Snippet,
										textEdit: TextEdit.replace(range, paramSnippet),
										command: {
											title: 'Suggest',
											command: 'editor.action.triggerSuggest'
										}
									});
								});

								return nonExclusiveResult(completionItems);
							}
						}
					}
				}
			}
		}

		return {
			analyzeDefaults: true,
			isExclusiveResult: false,
			items: []
		};
	}
};

export default Partial;
