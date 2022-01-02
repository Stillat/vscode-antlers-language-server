import {
	CompletionItem,
	CompletionItemKind,
	InsertTextFormat,
	MarkupKind,
	TextEdit,
} from "vscode-languageserver";
import { Range } from "vscode-languageserver-textdocument";
import { DocumentDetailsManager } from "../../../idehelper/documentDetailsManager";
import { IEnvironmentHelper } from "../../../idehelper/parser";
import { sessionDocuments } from '../../../languageService/documents';
import ProjectManager from "../../../projects/projectManager";
import { IView } from "../../../projects/views/view";
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import {
	IAntlersParameter,
	IAntlersTag,
	nonExclusiveResult,
	resultList,
} from "../../tagManager";
import { returnDynamicParameter } from "../dynamicParameterResolver";

const Partial: IAntlersTag = {
	tagName: "partial",
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
			expectsTypes: ["string"],
			isDynamic: false, 
		},
	],
	requiresClose: false,
	allowsContentClose: true,
	resolveDocumentation: (params:ISuggestionRequest) => {
		return `**Partial Tag**  
Includes another view into the current template.  

[Documentation Reference](https://statamic.dev/tags/partial)
`;
	},
	resolveDynamicParameter: returnDynamicParameter,
	resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
		if (parameter.isDynamic) {
			if (
				params.currentNode != null &&
				params.currentNode.getTagName() == "partial" &&
				params.currentNode.hasMethodPart()
			) {
				const nodeMethodName = params.currentNode.getMethodNameValue();

				if (nodeMethodName.trim().length > 0) {
					if (ProjectManager.instance?.hasStructure()) {
						const projectView = ProjectManager.instance
							.getStructure()
							.findRelativeView(nodeMethodName);

						if (
							projectView != null &&
							projectView.varReferenceNames.has(parameter.name)
						) {
							const viewDataRef = projectView.varReferenceNames.get(
								parameter.name
							) as string;

							if (
								projectView.viewDataDocument != null &&
								typeof projectView.viewDataDocument[viewDataRef] !== "undefined"
							) {
								const viewDataItems = Object.keys(
									projectView.viewDataDocument[viewDataRef]
								) as string[];

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
				isExclusiveResult: false,
			};
		}

		if (
			((params.leftWord == "partial" || params.leftWord == "/partial") &&
				params.leftChar == ":") ||
			(params.leftWord == 'src="' && params.leftChar == '"')
		) {
			const partials = params.project.getViews();

			partials.forEach((view: IView) => {
				if (DocumentDetailsManager.hasDetails(view.documentUri)) {
					const partialDetails = DocumentDetailsManager.documentDetails.get(
						view.documentUri
					) as IEnvironmentHelper;

					items.push({
						label:
							partialDetails.documentName +
							"(" +
							view.relativeDisplayName +
							")",
						insertText: view.relativeDisplayName,
						detail: partialDetails.documentName,
						documentation: {
							kind: MarkupKind.Markdown,
							value: partialDetails.documentDescription,
						},
						kind: CompletionItemKind.File,
					});
				} else {
					items.push({
						label: view.relativeDisplayName,
						kind: CompletionItemKind.File,
					});
				}
			});

			if (params.leftWord != 'src="') {
				items.push({
					label: "exists",
					kind: CompletionItemKind.Text,
				});
				items.push({
					label: "if_exists",
					kind: CompletionItemKind.Text,
				});
			}

			return {
				analyzeDefaults: false,
				isExclusiveResult: true,
				items,
			};
		}

		if (params.currentNode != null && params.project != null) {
			const viewName = getViewName(params.currentNode);

			if (viewName != null && viewName.trim().length > 0) {
				const viewRef = params.project.findRelativeView(viewName);

				if (viewRef != null) {
					if (sessionDocuments.hasDocument(viewRef.documentUri)) {
						const docInstance = sessionDocuments.getDocument(
							viewRef.documentUri
						);

						if (docInstance != null) {
							const symbols = docInstance.getAllAntlersNodes(),
								variableNames = getVariableNames(symbols),
								addedNames: string[] = [];

							if (viewRef.varReferenceNames != null) {
								viewRef.varReferenceNames.forEach((val, varName) => {
									variableNames.push(varName);
								});
							}

							if (variableNames.length > 0) {
								const completionItems: CompletionItem[] = [];
								const range: Range = {
									start: {
										line: params.position.line,
										character: params.position.character - 0,
									},
									end: params.position,
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
											title: "Suggest",
											command: "editor.action.triggerSuggest",
										},
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
			items: [],
		};
	},
};

function getViewName(node: AntlersNode) {
	if (node.getTagName() != "partial") {
		return null;
	}

	let partialName = "";

	if (node.hasMethodPart()) {
		partialName = node.getMethodNameValue();
	} else {
		const srcParam = node.findParameter("src");

		if (srcParam != null) {
			partialName = srcParam.value;
		}
	}

	return partialName;
}

function getVariableNames(symbols: AntlersNode[]): string[] {
	const namesToReturn: string[] = [];

	symbols.forEach((symbol: AntlersNode) => {
		if (symbol.isTagNode || symbol.isClosingTag) {
			return;
		}

		if (symbol.isComment) {
			return;
		}

		if (symbol.hasMethodPart() && symbol.getMethodNameValue().length > 0) {
			return;
		}

		if (symbol.name != null && symbol.name.content.includes("[")) {
			return;
		}

		const nodeTagName = symbol.getTagName();

		if (
			!namesToReturn.includes(nodeTagName) &&
			nodeTagName != "#" &&
			nodeTagName != "slot"
		) {
			namesToReturn.push(nodeTagName);
		}
	});

	return namesToReturn;
}


export default Partial;
