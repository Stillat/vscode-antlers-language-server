import { CompletionItem, CompletionItemKind, InsertTextFormat, Position, TextEdit, } from "vscode-languageserver-protocol";
import { Range } from "vscode-languageserver-textdocument";
import ModifierManager from '../antlers/modifierManager';
import { parseMacros } from '../antlers/modifiers/macros';
import { IModifier } from '../antlers/modifierTypes';
import { Scope } from '../antlers/scope/scope';
import { IScopeVariable } from '../antlers/scope/types';
import {
    IAntlersParameter,
    IAntlersTag
} from "../antlers/tagManager";
import TagManager from '../antlers/tagManagerInstance';
import { UnclosedTagManager } from "../antlers/unclosedTagManager";
import { ContentVariableNames } from "../antlers/variables/contentVariables";
import { IBlueprintField } from '../projects/blueprints/fields';
import { AntlersNode, StringValueNode, EqualCompOperator, VariableNode } from '../runtime/nodes/abstractNode';
import { trimLeft, trimRight } from "../utils/strings";
import { DocumentPropertySuggestions } from './comments/documentPropertySuggestions';
import LanguageConstructs from "./defaults/languageConstructs";
import { makeFieldSuggest, makeModifierSuggest } from "./fieldFormatter";
import { GenericTypesSuggestions } from "./genericTypesSuggestions";
import { getParameterCompletionItems } from "./parameterSuggestionProvider";
import { ScopeVariableSuggestionsManager } from "./scopeVariableSuggestionsManager";
import { ISuggestionRequest } from './suggestionRequest';

const ConditionalCompletionTriggers: string[] = ["if", "elseif", "unless", "elseunless"];

const InvalidTriggers: string[] = ["else", "/if"];


function isCursorInsideSymbol(symbol: AntlersNode, position: Position): boolean {
    const startLine = symbol.startPosition?.line ?? -1,
        endLine = symbol.endPosition?.line ?? - -1,
        startOffset = symbol.startPosition?.char ?? -1,
        endOffset = symbol.endPosition?.char ?? - 1,
        checkLine = position.line + 1,
        checkChar = position.character + 1;

    if (startLine == endLine) {
        if (checkLine == startLine + 1 && (
            checkChar > startOffset &&
            checkChar <= endOffset
        )) {
            return true;
        }
    }

    if (checkLine == startLine && checkChar > startOffset &&
        checkChar <= endOffset) {
        return true;
    }

    if (checkLine == endLine && checkChar < endOffset) {
        return true;
    }

    if (checkLine > startLine && checkLine < endLine) {
        return true;
    }

    return false;
}


export function getCurrentSymbolMethodNameValue(params: ISuggestionRequest): string {
    let valueToReturnn = "";

    if (params.currentNode != null) {
        valueToReturnn = params.currentNode.getMethodNameValue();
    }

    return valueToReturnn;
}

export function getRoot(word: string): string {
    if (word.includes(":") == false) {
        return word;
    }

    const parts = word.split(":");

    if (parts.length > 1) {
        return parts[parts.length - 1];
    }

    return parts[0].trim();
}

export function getAbsoluteRoot(word: string): string {
    if (word.includes(":") == false) {
        return word;
    }

    return word.split(":")[0];
}

export function convertImmediateScopeToCompletionList(params: ISuggestionRequest): CompletionItem[] {
    if (params.nodesInScope.length == 0) {
        return [];
    }

    let lastScopeItem = params.nodesInScope[params.nodesInScope.length - 1];

    if (params.context?.node != null) {
        lastScopeItem = params.context.node;
    }

    if (lastScopeItem.currentScope == null) {
        return [];
    }

    return convertScopeToCompletionList(params, lastScopeItem.currentScope);
}

export function convertScopeToCompletionList(params: ISuggestionRequest, scope: Scope): CompletionItem[] {
    const items: CompletionItem[] = [];

    scope.values.forEach((val: IScopeVariable) => {
        if (val.sourceField != null) {
            items.push({
                label: val.name,
                detail: val.sourceField.blueprintName,
                documentation: val.sourceField.instructionText ?? "",
                kind: CompletionItemKind.Field,
            });
        } else {
            items.push(makeFieldSuggest(val.name, "", ""));
        }

        if (val.dataType.trim().length > 0 && val.dataType == "array") {
            const arrayCompleteSnippet =
                val.name + " }}\n    $1\n{{ /" + val.name + " ",
                range: Range = {
                    start: {
                        line: params.position.line,
                        character:
                            params.position.character - params.originalLeftWord.length,
                    },
                    end: params.position,
                };

            items.push({
                label: val.name + " loop",
                insertTextFormat: InsertTextFormat.Snippet,
                kind: CompletionItemKind.Snippet,
                textEdit: TextEdit.replace(range, arrayCompleteSnippet),
                command: {
                    title: "Suggest",
                    command: "editor.action.triggerSuggest",
                },
            });
        }
    });

    scope.lists.forEach((val: Scope, key: string) => {
        items.push(makeFieldSuggest(key, "", ""));
    });

    return items;
}

export function getModifierCompletionList(): CompletionItem[] {
    const items: CompletionItem[] = [];

    ModifierManager.instance?.getRegisteredModifiers().forEach((modifier: IModifier) => {
        items.push(makeModifierSuggest(modifier));
    });

    return items;
}

export class SuggestionManager {
    static getSuggestions(params: ISuggestionRequest | null): CompletionItem[] {
        if (params == null) {
            return [];
        }

        if (params.context != null &&
            params.context.node != null &&
            params.context.node.isComment) {
            if (params.context.node.antlersNodeIndex == 1) {
                return DocumentPropertySuggestions;
            }
            return [];
        }

        if (params.nodesInScope.length == 0) {
            return [];
        }

        if (params.leftMeaningfulWord == null && params.leftChar == "/") {
            const unclosedTags = UnclosedTagManager.getUnclosedTags(
                params.document,
                params.position
            );

            if (unclosedTags.length > 0) {
                const closeTagCompletions: CompletionItem[] = [];
                let suffix = "";

                if (params.rightChar == "}") {
                    suffix = " ";
                }

                for (let i = 0; i < unclosedTags.length; i++) {
                    closeTagCompletions.push({
                        label: unclosedTags[i].runtimeName() + suffix,
                        kind: CompletionItemKind.Text,
                    });
                }

                return closeTagCompletions;
            }
        }

        const lastScopeItem = params.nodesInScope[params.nodesInScope.length - 1];

        let completionItems: CompletionItem[] = [],
            injectParentScope = true;

        if (lastScopeItem.currentScope != null && params.context?.variableContext != null) {
            if (params.context.variableContext.varPathText.length > 0) {
                if (lastScopeItem.currentScope.hasListInHistory(params.context.variableContext.varPathText)) {
                    const scopeList = lastScopeItem.currentScope.getList(params.context.variableContext.varPathText);

                    if (scopeList != null) {
                        convertScopeToCompletionList(params, scopeList).forEach((item) => {
                            completionItems.push({
                                ...item,
                                sortText: '00'
                            });
                        });
                    }
                } else if (lastScopeItem.currentScope.containsPath(params.context.variableContext.varPathText)) {
                    const scopeList = lastScopeItem.currentScope.findNestedScope(params.context.variableContext.varPathText);

                    if (scopeList != null) {
                        convertScopeToCompletionList(params, scopeList).forEach((item) => {
                            completionItems.push({
                                ...item,
                                sortText: '00'
                            });
                        });
                    }
                }
            }
        }

        if (params.context?.modifierContext != null) {
            if (params.context.modifierContext.inModifierName ||
                (params.context.modifierContext.inModifierName == false && params.context.modifierContext.inModifierParameter == false) ||
                params.context.feature == null ||
                (params.leftChar == '|' && params.context.char == ' ')) {
                completionItems = completionItems.concat(getModifierCompletionList());
            }
        }

        if (params.nodesInScope.length >= 2) {
            const startIndex = params.nodesInScope.length - 2;
            let scopeSymbolItems: CompletionItem[] = [];

            for (let i = startIndex; i >= 0; i--) {
                const symbolToAnalyze = params.nodesInScope[i];

                scopeSymbolItems = scopeSymbolItems.concat(
                    ScopeVariableSuggestionsManager.getVariableSuggestions(
                        params,
                        symbolToAnalyze
                    )
                );
            }

            if (scopeSymbolItems.length > 0) {
                completionItems = completionItems.concat(scopeSymbolItems);
            }
        }

        if (params.currentNode?.isEmpty() ||
            params.context?.isCursorInIdentifier && params.leftChar != ':' && params.leftChar != ' ') {
            if (params.context?.modifierContext == null) {
                const allTagNames = TagManager.instance?.getVisibleTagsWithDocumentation() ?? [],
                    addedTagNames: string[] = [],
                    tagCompletions: CompletionItem[] = [];

                for (let i = 0; i < allTagNames.length; i++) {
                    let sort: string | undefined = '000';

                    if (params.leftWord != null) {
                        if (allTagNames[i].label.startsWith(params.leftWord) == false) {
                            sort = '001';
                        }
                    }

                    if (params.context?.node != null && params.context?.node.parent != null) {
                        sort = undefined;
                    }

                    if (allTagNames[i].label.includes(":") == false) {
                        if (addedTagNames.includes(allTagNames[i].label) == false) {
                            tagCompletions.push({
                                label: allTagNames[i].label,
                                kind: CompletionItemKind.Text,
                                documentation: {
                                    kind: 'markdown',
                                    value: allTagNames[i].documentation
                                },
                                sortText: sort
                            });
                            addedTagNames.push(allTagNames[i].label);
                        }
                    } else {
                        const adjustedTagName = allTagNames[i].label.split(":")[0] as string;

                        if (addedTagNames.includes(adjustedTagName) == false) {
                            tagCompletions.push({
                                label: adjustedTagName,
                                kind: CompletionItemKind.Text,
                                documentation: {
                                    kind: 'markdown',
                                    value: allTagNames[i].documentation
                                },
                                sortText: sort
                            });
                            addedTagNames.push(adjustedTagName);
                        }
                    }
                }

                completionItems = completionItems.concat(tagCompletions);
            }
        }

        if (lastScopeItem != null && lastScopeItem.currentScope != null) {
            if (InvalidTriggers.includes(lastScopeItem.getTagName())) {
                return [];
            }

            if (params.context?.node == null) {
                return [];
            }

            if (ConditionalCompletionTriggers.includes(lastScopeItem.getTagName())) {
                if (params.context.feature != null &&
                    params.context.feature instanceof StringValueNode &&
                    params.context.feature.prev instanceof EqualCompOperator &&
                    params.context.feature.prev.prev instanceof VariableNode) {
                    const docParser = lastScopeItem.getParser();

                    if (docParser != null && params.project != null) {
                        if (docParser.getLanguageParser().isMergedVariableComponent(params.context.feature.prev.prev)) {
                            const mergedVariable = docParser.getLanguageParser().getMergedVariable(params.context.feature.prev.prev);
                            let handleBasedItems: string[] = [];


                            if (mergedVariable.name == 'collection:handle') {
                                handleBasedItems = params.project.getUniqueCollectionNames();
                            } else if (mergedVariable.name == 'site:handle') {
                                handleBasedItems = params.project.getSiteNames();
                            } else if (mergedVariable.name == 'blueprint:handle') {
                                handleBasedItems = params.project.getBlueprintNames();
                            }

                            handleBasedItems.forEach((completionItem) => {
                                completionItems.push({
                                    label: completionItem,
                                    sortText: completionItem,
                                    kind: CompletionItemKind.EnumMember
                                });
                            });

                            return completionItems;
                        }
                    }

                    const specialVarNames = [
                        'collection', 'current_template', 'status'
                    ];

                    if (specialVarNames.includes(params.context.feature.prev.prev.name)) {
                        if (params.project != null) {
                            const specialVarName = params.context.feature.prev.prev.name;

                            let varItems: string[] = [];

                            if (specialVarName == 'collection') {
                                varItems = params.project.getUniqueCollectionNames();
                            } else if (specialVarName == 'current_template') {
                                varItems = params.project.getTemplateNames();
                            } else if (specialVarName == 'status') {
                                varItems = ['draft', 'scheduled', 'expired', 'published'];
                            }

                            varItems.forEach((name) => {
                                completionItems.push({
                                    label: name,
                                    sortText: name,
                                    kind: CompletionItemKind.EnumMember
                                });
                            });

                            return completionItems;
                        }
                    } else if (params.context.feature.prev.prev.scopeVariable != null) {
                        const currentDataType = params.context.feature.prev.prev.scopeVariable.dataType;

                        if (currentDataType == 'replicator' || currentDataType == 'bard') {
                            const field = params.context.feature.prev.prev.scopeVariable.sourceField as IBlueprintField;
                            field.sets?.forEach((set) => {
                                let docs = '**' + set.displayName + '** `' + set.handle + '`  ';

                                docs += "\n\n Blueprint: `" + field.blueprintName + "`  \n";

                                set.fields.forEach((field) => {
                                    docs += "\n * " + field.displayName + ' `' + field.name + ':' + field.type + '`  ';
                                });

                                if (currentDataType == 'replicator') {
                                    docs += "\n\n [Replicator Templating Documentation](https://statamic.dev/fieldtypes/replicator#templating)";
                                } else {
                                    docs += "\n\n [Bard Templating Documentation](https://statamic.dev/fieldtypes/bard#with-sets)";
                                }

                                completionItems.push({
                                    label: set.displayName,
                                    insertText: set.handle,
                                    sortText: '000',
                                    documentation: {
                                        kind: 'markdown',
                                        value: docs
                                    },
                                    kind: CompletionItemKind.EnumMember
                                });
                            });

                            return completionItems;
                        }
                    }
                }
            }

            if (lastScopeItem.isTagNode == false) {
                completionItems = completionItems.concat(LanguageConstructs);

                const range: Range = {
                    start: {
                        line: params.position.line,
                        character:
                            params.position.character - params.originalLeftWord.length,
                    },
                    end: params.position,
                };

                const ifElseSnippet = "if $1 }}\n    $2\n{{ else }}\n\n{{ /if ";
                completionItems.push({
                    label: "ifelse",
                    insertTextFormat: InsertTextFormat.Snippet,
                    kind: CompletionItemKind.Snippet,
                    textEdit: TextEdit.replace(range, ifElseSnippet),
                    command: {
                        title: "Suggest",
                        command: "editor.action.triggerSuggest",
                    },
                });

                if (lastScopeItem.scopeVariable != null) {
                    completionItems = completionItems.concat(
                        GenericTypesSuggestions.getCompletions(
                            params,
                            lastScopeItem.scopeVariable
                        )
                    );
                }
            }

            if (lastScopeItem.currentScope.hasListInHistory(lastScopeItem.runtimeName()) == false &&
                lastScopeItem.currentScope.hasPristineReference(
                    lastScopeItem.runtimeName()
                ) == false
            ) {
                injectParentScope = TagManager.instance?.injectParentScope(lastScopeItem.runtimeName()) ?? false;
            } else {
                injectParentScope = false;
            }

            if (params.context?.parameterContext != null && params.context.parameterContext.parameter != null) {
                if (params.context.parameterContext.parameter.isVariableReference == false) {
                    injectParentScope = false;
                } else {
                    injectParentScope = true;
                }

                /*if (params.context.parameterContext.parameter.isVariableReference == false &&
                    params.isInVariableInterpolation == false) {
                    return [];
                }*/
            }

            if (params.currentNode != null && (params.currentNode.isEmpty() || params.currentNode.parent != null)) {
                injectParentScope = true;
            }

            // If we have a compound runtime name, lets check if we have a specific scope value here.
            if (lastScopeItem.runtimeName().includes(":")) {
                if (
                    lastScopeItem.currentScope.containsPath(
                        trimRight(lastScopeItem.runtimeName(), ":")
                    )
                ) {
                    const checkPath = trimRight(lastScopeItem.runtimeName(), ":"),
                        checkWord = trimLeft(trimRight(params.leftWord, ":"), "{");

                    // As the user is typing, we will attempt to provide the most specific results we can.
                    if (checkPath == checkWord) {
                        const specificScope =
                            lastScopeItem.currentScope.findNestedScope(checkPath);

                        if (specificScope != null) {
                            specificScope.lists.forEach((val: Scope, key: string) => {
                                completionItems.push(makeFieldSuggest(key, "", ""));
                            });
                            specificScope.values.forEach((val: IScopeVariable) => {
                                if (val.sourceField != null) {
                                    completionItems.push({
                                        label: val.name,
                                        detail: val.sourceField.blueprintName,
                                        documentation: val.sourceField.instructionText ?? "",
                                        kind: CompletionItemKind.Field,
                                    });
                                } else {
                                    completionItems.push(makeFieldSuggest(val.name, "", ""));
                                }
                            });

                            return completionItems;
                        }
                    }
                }
            }

            // Handle the case where the provided tag part does not include a ":" character.
            if (lastScopeItem.isTagNode) {
                if (
                    params.isInVariableInterpolation &&
                    params.currentNode == null
                ) {
                    completionItems = completionItems.concat(convertScopeToCompletionList(params, lastScopeItem.currentScope.ancestor()));
                } else {
                    if (params.context?.parameterContext != null && params.context.parameterContext.parameter != null) {
                        const tActiveParam = params.context.parameterContext.parameter;

                        if (tActiveParam.isVariableReference &&
                            params.position.character <= (tActiveParam.valuePosition?.end?.char ?? -1)) {
                            completionItems = completionItems.concat(convertScopeToCompletionList(params, lastScopeItem.currentScope.ancestor()));

                            if (TagManager.instance != null) {
                                const tagManagerResult = TagManager.instance.getCompletionItems(params);

                                completionItems = completionItems.concat(
                                    tagManagerResult.items
                                );
                            }
                        } else {
                            // Given some active parameter and a tag reference, can we provide a list of valid completion items?
                            if (params.position.character <= (tActiveParam.valuePosition?.end?.char ?? - 1)) {
                                let tagParameter: IAntlersParameter | null = null,
                                    didSearchForDynamicParameter = false;

                                if (TagManager.instance?.canResolveDynamicParameter(lastScopeItem.runtimeName())) {
                                    const tagRef = TagManager.instance.findTag(
                                        lastScopeItem.runtimeName()
                                    ) as IAntlersTag;

                                    if (
                                        typeof tagRef !== "undefined" &&
                                        typeof tagRef.resolveDynamicParameter !== "undefined" &&
                                        tagRef.resolveDynamicParameter != null
                                    ) {
                                        tagParameter = tagRef.resolveDynamicParameter(
                                            lastScopeItem,
                                            tActiveParam.name
                                        );
                                        didSearchForDynamicParameter = true;
                                    }
                                } else {
                                    tagParameter = TagManager.instance?.getParameter(
                                        lastScopeItem.runtimeName(),
                                        tActiveParam.name
                                    ) ?? null;
                                }

                                if (tagParameter == null && didSearchForDynamicParameter) {
                                    tagParameter = TagManager.instance?.getParameter(
                                        lastScopeItem.runtimeName(),
                                        tActiveParam.name
                                    ) ?? null;
                                }

                                if (typeof tagParameter !== "undefined" && tagParameter !== null) {
                                    const tagReferenceResult = TagManager.instance?.resolveParameterCompletions(
                                        lastScopeItem.runtimeName(),
                                        tagParameter,
                                        params
                                    ) ?? null;

                                    if (tagReferenceResult !== null && tagReferenceResult.items.length > 0
                                    ) {
                                        tagReferenceResult.items.forEach((item) => {
                                            item.sortText = '000';

                                            completionItems.push(item);
                                        });
                                    } else {
                                        getParameterCompletionItems(tagParameter).forEach((item) => {
                                            item.sortText = '000';

                                            completionItems.push(item);
                                        });
                                    }
                                }

                                if (tActiveParam.hasInterpolations() && params.isInVariableInterpolation && lastScopeItem.isTagNode) {
                                    const interpolatedTagRef = TagManager.instance?.findTag(
                                        lastScopeItem.runtimeName()
                                    ) as IAntlersTag;

                                    if (interpolatedTagRef.resolveCompletionItems != null) {
                                        const interpolatedResults =
                                            interpolatedTagRef.resolveCompletionItems(params);

                                        if (interpolatedResults.items.length > 0) {
                                            completionItems = interpolatedResults.items;
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        if (params.isInVariableInterpolation == false || (params.currentNode == lastScopeItem)) {
                            const caretInSymbolOpen = isCursorInsideSymbol(
                                lastScopeItem,
                                params.position
                            );

                            params.isCaretInTag = caretInSymbolOpen;
                            params.currentNode = lastScopeItem;

                            if (TagManager.instance != null) {
                                const tagManagerResult = TagManager.instance.getCompletionItems(params);

                                if (tagManagerResult.isExclusive) {
                                    completionItems = tagManagerResult.items;
                                } else {
                                    completionItems = completionItems.concat(
                                        tagManagerResult.items
                                    );
                                }
                            }
                        }
                    }
                }
            } else if (
                params.isInVariableInterpolation &&
                params.currentNode == null
            ) {
                completionItems = completionItems.concat(convertScopeToCompletionList(params, lastScopeItem.currentScope.ancestor()));
            }


            if (injectParentScope) {
                if (params.context.node != null && params.context.node.currentScope != null) {
                    if (params.context.modifierContext == null || (params.context.modifierContext.activeModifier == null)) {
                        completionItems = completionItems.concat(convertScopeToCompletionList(params, params.context.node.currentScope));
                    }
                }

                const paramDocPath = decodeURIComponent(params.document);

                if (params.project.hasViewCollectionInjections(paramDocPath)) {
                    const viewCollectionNames =
                        params.project.getCollectionNamesForView(paramDocPath);

                    for (let i = 0; i < viewCollectionNames.length; i++) {
                        const blueprintFields =
                            params.project.getBlueprintFields(viewCollectionNames);

                        if (blueprintFields.length > 0) {
                            for (let j = 0; j < blueprintFields.length; j++) {
                                const field = blueprintFields[j];

                                completionItems.push({
                                    label: field.name,
                                    detail: field.blueprintName,
                                    documentation: field.instructionText ?? "",
                                    kind: CompletionItemKind.Field,
                                });
                            }
                        }
                    }

                    ContentVariableNames.forEach((variableName: string) => {
                        completionItems.push({
                            label: variableName,
                            kind: CompletionItemKind.Field,
                        });
                    });
                }
            }

            if (params.context.node != null) {
                if (params.context.node.manifestType == "array" && params.context.node.isClosedBy != null) {
                    if (params.context.modifierContext != null) {
                        const arrayModifiers = ModifierManager.instance?.getModifiersForType("array") ?? [];

                        arrayModifiers.forEach((modifier: IModifier) => {
                            const suggestion = makeModifierSuggest(modifier);
                            suggestion.sortText = '000';

                            completionItems.push(suggestion);
                        });
                    }
                } else {
                    if (params.context.modifierContext != null) {
                        const arrayModifiers = ModifierManager.instance?.getModifiersForType(params.context.node.manifestType) ?? [];

                        arrayModifiers.forEach((modifier: IModifier) => {
                            const suggestion = makeModifierSuggest(modifier);
                            suggestion.sortText = '000';

                            completionItems.push(suggestion);
                        });
                    }
                }
            }

            return completionItems;
        }

        for (let i = 0; i < params.nodesInScope.length; i++) {
            const currentSymbol = params.nodesInScope[i];
            let shouldProceed = true;

            if (params.isInVariableInterpolation && params.currentNode !== null) {
                if (currentSymbol.currentScope != null && params.currentNode.currentScope != null && currentSymbol.currentScope.generation > params.currentNode.currentScope.generation) {
                    shouldProceed = false;
                }
            }

            if (currentSymbol.isTagNode && shouldProceed) {
                const caretInSymbolOpen = isCursorInsideSymbol(
                    currentSymbol,
                    params.position
                );

                params.isCaretInTag = caretInSymbolOpen;
                params.currentNode = currentSymbol;

                if (TagManager.instance != null) {
                    const tagManagerResult = TagManager.instance.getCompletionItems(params);

                    if (tagManagerResult.isExclusive) {
                        completionItems = tagManagerResult.items;
                        break;
                    }

                    completionItems = completionItems.concat(tagManagerResult.items);
                }
                continue;
            }
        }

        return completionItems;
    }
}
