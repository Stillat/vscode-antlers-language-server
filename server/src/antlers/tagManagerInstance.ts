import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import ProjectManager from '../projects/projectManager.js';
import { IProjectDetailsProvider } from '../projects/projectDetailsProvider.js';
import { makeTagParameterSuggestions } from "../suggestions/attributeSuggestions.js";
import { formatSuggestion } from "../suggestions/fieldFormatter.js";
import { trimLeft } from "../utils/strings.js";
import { IAntlersTag, IAntlersParameter, IProviderCompletionResult, ICompletionResult } from "./tagManager.js";
import { coreTags } from "./tags/coreTags.js";
import { ISpecialResolverResults } from "./types.js";
import { ISuggestionRequest } from '../suggestions/suggestionRequest.js';
import { AntlersNode } from '../runtime/nodes/abstractNode.js';
import { IDocumentedLabel } from './documentedLabel.js';

class TagManager {
    private tags: Map<string, IAntlersTag> = new Map();
    private parameters: Map<string, Map<string, IAntlersParameter>> = new Map();

    public static instance: TagManager | null = null;

    reset() {
        this.tags.clear();
        this.parameters.clear();

        this.loadCoreTags();
    }

    getVisibleTagsWithDocumentation(): IDocumentedLabel[] {
        const tags: IDocumentedLabel[] = [];

        this.tags.forEach((tag: IAntlersTag, name: string) => {
            if (tag.hideFromCompletions == false) {
                let docs = '';

                if (tag.resolveDocumentation != null) {
                    docs = tag.resolveDocumentation();
                }

                tags.push({
                    label: name,
                    documentation: docs
                });
            }
        });

        ProjectManager.instance?.getStructure()?.getCustomAntlersTags().forEach((tag) => {
            tags.push({
                label: tag.tagName,
                documentation: ''
            })
        });

        return tags;
    }

    getCustomTagMethodsForTag(tagName:string): string[] {
        const items:string[] = [],
            len = tagName.length + 1;

        ProjectManager.instance?.getStructure()?.getCustomAntlersTags().forEach((tag) => {
            if (tag.tagName.startsWith(`${tagName}:`)) {
                const methodName = tag.tagName.substr(len).trim();

                if (methodName.length > 0) {
                    items.push(methodName);
                }
            }
        });

        return items;
    }

    getVisibleTagNames(): string[] {
        const tagNames: string[] = [];

        this.tags.forEach((tag: IAntlersTag, name: string) => {
            if (tag.hideFromCompletions == false) {
                tagNames.push(name);
            }
        });

        ProjectManager.instance?.getStructure()?.getCustomAntlersTags().forEach((tag) => {
            tagNames.push(tag.tagName);
        });

        return [...new Set(tagNames)];
    }

    getPossibleTagMethods(tagName: string): string[] {
        const methodNames: string[] = [],
            len = tagName.length + 1;

        this.tags.forEach((tag: IAntlersTag, name: string) => {
            if (name.startsWith(tagName)) {
                const methodName = name.substr(len).trim();

                if (methodName.length > 0) {
                    methodNames.push(methodName);
                }
            }
        });

        ProjectManager.instance?.getStructure()?.getCustomAntlersTags().forEach((tag) => {
            if (tag.tagName.startsWith(`${tagName}:`)) {
                const methodName = tagName.substr(len).trim();

                if (methodName.length > 0) {
                    methodNames.push(methodName);
                }
            }
        });

        return [...new Set(methodNames)];
    }

    getTagNames(): string[] {
        const tagNames: string[] = [];

        this.tags.forEach((tag: IAntlersTag, name: string) => {
            tagNames.push(name);
        });

        ProjectManager.instance?.getStructure()?.getCustomAntlersTags().forEach((tag) => {
            tagNames.push(tag.tagName);
        });

        return [...new Set(tagNames)];
    }

    loadCoreTags() {
        this.registerTags(coreTags);
    }

    cleanTagName(name: string): string {
        return trimLeft(name, "/");
    }

    findTag(name: string): IAntlersTag | undefined {
        return this.tags.get(this.resolveTagName(name));
    }

    findCustomTag(name: string): IAntlersTag | undefined {
        const customTags = ProjectManager.instance?.getStructure()?.getCustomAntlersTags() ?? [];

        for (let i = 0; i < customTags.length; i++) {
            if (customTags[i].tagName == name) {
                return customTags[i];
            }
        }

        return;
    }

    isKnownTag(name: string): boolean {
        return this.tags.has(this.resolveTagName(name)) || this.isCustomTag(name);
    }

    isSymbolKnownTag(node: AntlersNode): boolean {
        return this.isKnownTag(node.runtimeName());
    }

    resolveTagName(name: string): string {
        name = this.cleanTagName(name.trim());

        // Handle the case of "most specific" tag.
        if (this.tags.has(name)) {
            return name;
        }

        if (name.includes(":")) {
            name = name.split(":")[0];
        }

        return name;
    }

    canResolveSpecialTypes(name: string): boolean {
        // If the provided name can be resolve as-is
        // to a specific tag definition, we must
        // use that "most specific" definition.
        // e.g., collection:count is not
        // a collection named "count"
        // but a distinct tag entry.
        name = this.resolveTagName(name);

        const tag = this.tags.get(name) as IAntlersTag;

        if (typeof tag === "undefined" || tag == null) {
            return false;
        }

        if (tag.resolveSpecialType == null) {
            return false;
        }

        return true;
    }

    resolveSpecialType(
        tagName: string,
        symbol: AntlersNode,
        project: IProjectDetailsProvider
    ): ISpecialResolverResults {
        tagName = this.resolveTagName(tagName);

        const tag = this.findTag(tagName) as IAntlersTag;

        if (tag.resolveSpecialType == null) {
            throw new Error(tagName + " does not support special types.");
        }

        return tag.resolveSpecialType(symbol, project);
    }

    isCustomTag(name:string):boolean {
        const customTags = ProjectManager.instance?.getStructure()?.getCustomAntlersTags() ?? [];

        for (var i = 0; i < customTags.length; i++) {
            if (customTags[i].tagName == name) {
                return true;
            }
        }

        return false;
    }

    getCompletionItems(params: ISuggestionRequest): IProviderCompletionResult {
        let lastScopeItem = null;
        let resolvedParams: CompletionItem[] = [];
        let runDefaultAnalysis = true;

        if (params.context != null && params.context.node != null) {
            params.currentNode = params.context.node;
        }

        if (params.nodesInScope.length > 0) {
            lastScopeItem = params.nodesInScope[params.nodesInScope.length - 1];
        }

        if (params.currentNode != null) {
            if (this.isKnownTag(params.currentNode.runtimeName()) || this.isCustomTag(params.currentNode.getTagName())) {
                let tagReference = this.findTag(
                    params.currentNode.runtimeName()
                ) as IAntlersTag;

                if (typeof tagReference === "undefined") {
                    tagReference = this.findCustomTag(params.currentNode.getTagName()) as IAntlersTag;

                    if (typeof tagReference === "undefined") {
                        return {
                            isExclusive: false,
                            items: [],
                        };
                    }
                }

                const dynamicRefNames: string[] = [];

                if (tagReference.resolveCompletionItems != null) {
                    const result = tagReference.resolveCompletionItems(params),
                        customMethods = this.getCustomTagMethodsForTag(tagReference.tagName);

                    if (customMethods.length > 0) {
                        customMethods.forEach((method) => {
                            result.items.push({
                                label: method,
                                kind: CompletionItemKind.Text,
                                insertText: method
                            })
                        });
                    }

                    if (result.isExclusiveResult) {
                        return {
                            isExclusive: true,
                            items: result.items,
                        };
                    }

                    runDefaultAnalysis = result.analyzeDefaults;
                    resolvedParams = resolvedParams.concat(result.items);
                }

                if (params.isPastTagPart == false) {
                    const tagMethodNames = this.getPossibleTagMethods(
                        tagReference.tagName
                    );

                    for (let i = 0; i < tagMethodNames.length; i++) {
                        resolvedParams.push({
                            label: tagMethodNames[i],
                            kind: CompletionItemKind.Text,
                        });
                    }
                }

                if (runDefaultAnalysis) {
                    // Here we will gather the declared parameters and add them to make things easier.
                    if (
                        params.isCaretInTag == true &&
                        tagReference.parameters.length > 0
                    ) {
                        resolvedParams = resolvedParams.concat(
                            makeTagParameterSuggestions(params, tagReference.parameters)
                        );

                        if (tagReference.tagName == "partial") {
                            if (lastScopeItem?.hasMethodPart()) {
                                const lastMethodName = lastScopeItem.getMethodNameValue();

                                if (lastMethodName.trim().length > 0) {
                                    if (ProjectManager.instance?.hasStructure()) {
                                        const projectView =
                                            ProjectManager.instance.getStructure().findPartial(lastMethodName);

                                        if (
                                            projectView != null &&
                                            projectView.injectsParameters.length > 0
                                        ) {
                                            resolvedParams = resolvedParams.concat(
                                                makeTagParameterSuggestions(
                                                    params,
                                                    projectView.injectsParameters
                                                )
                                            );
                                        }
                                    }
                                }
                            }
                        }
                    }

                    for (let i = 0; i < params.nodesInScope.length; i++) {
                        if (params.nodesInScope[i].runtimeType !== null) {
                            const thisRuntimeType = params.nodesInScope[i].runtimeType;

                            if (
                                thisRuntimeType != null &&
                                thisRuntimeType.assumedType == "structure_ref" &&
                                thisRuntimeType.supplementedFields != null
                            ) {
                                for (
                                    let j = 0;
                                    j < thisRuntimeType.supplementedFields.length;
                                    j++
                                ) {
                                    resolvedParams.push(
                                        formatSuggestion(thisRuntimeType.supplementedFields[j])
                                    );
                                }
                            }
                        }
                    }
                }

                return {
                    items: resolvedParams,
                    isExclusive: false,
                };
            }
        }

        return {
            items: resolvedParams,
            isExclusive: false,
        };
    }

    injectParentScope(tag: string): boolean {
        const tagReference = this.findTag(tag);

        if (typeof tagReference === "undefined" || tagReference == null) {
            return true;
        }

        return tagReference.injectParentScope;
    }

    resolveParameterCompletions(tag: string, parameter: IAntlersParameter, params: ISuggestionRequest): ICompletionResult | null {
        const tagReference = this.findTag(tag);

        if (typeof tagReference !== "undefined" && tagReference !== null) {
            if (
                typeof tagReference.resovleParameterCompletionItems !== "undefined" &&
                tagReference.resovleParameterCompletionItems !== null
            ) {
                return tagReference.resovleParameterCompletionItems(parameter, params);
            }
        }

        return null;
    }

    canResolveDynamicParameter(tag: string): boolean {
        const tagName = this.resolveTagName(tag);

        if (this.isKnownTag(tagName)) {
            const tagRef = this.tags.get(tagName) as IAntlersTag;

            if (typeof tagRef === "undefined") {
                return false;
            }

            if (
                typeof tagRef.resolveDynamicParameter !== "undefined" &&
                tagRef.resolveDynamicParameter != null
            ) {
                return true;
            }
        }
        return false;
    }

    getParameter(tag: string, param: string): IAntlersParameter | null {
        const tagName = this.resolveTagName(tag);

        if (this.parameters.has(tagName) == false) {
            return null;
        }

        const tagParams = this.parameters.get(tagName);

        if (tagParams == null) {
            return null;
        }

        if (tagParams.has(param) == false) {
            const tagRef = this.findTag(tag);

            if (tagRef != null && typeof tagRef.resolveDynamicParameter !== 'undefined' &&
                tagRef.resolveDynamicParameter != null) {
                const dynamicParam = tagRef.resolveDynamicParameter(null, param);

                if (dynamicParam !== null) {
                    return dynamicParam;
                }
            }

            return null;
        }

        const tagParam = tagParams.get(param);

        if (typeof tagParam == "undefined" || tagParams == null) {
            return null;
        }

        return tagParam;
    }

    registerTags(tags: IAntlersTag[]) {
        for (let i = 0; i < tags.length; i++) {
            this.registerTag(tags[i]);
        }
    }

    registerTag(tag: IAntlersTag) {
        this.tags.set(tag.tagName, tag);

        if (this.parameters.has(tag.tagName) == false) {
            this.parameters.set(tag.tagName, new Map());
        }

        if (tag.parameters.length > 0) {
            // Get a reference to this tag's specific parameter map.
            const thisTagsMap = this.parameters.get(tag.tagName);

            for (let i = 0; i < tag.parameters.length; i++) {
                const curParam = tag.parameters[i];

                thisTagsMap?.set(curParam.name, curParam);
            }
        }
    }

    requiresClose(node: AntlersNode): boolean {
        const nodeTagName = node.getTagName();

        if (this.tags.has(nodeTagName)) {
            const tag = this.findTag(nodeTagName);

            if (tag != null) {
                if (tag.requiresCloseResolver != null) {
                    return tag.requiresCloseResolver(node);
                }

                return tag.requiresClose;
            }
        }

        return false;
    }
}

if (typeof TagManager.instance == 'undefined' || TagManager.instance == null) {
    TagManager.instance = new TagManager();
    TagManager.instance.loadCoreTags();

}

export default TagManager;