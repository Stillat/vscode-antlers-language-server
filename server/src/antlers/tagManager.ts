import {
    CompletionItem,
    CompletionItemKind,
} from "vscode-languageserver-types";
import { IBlueprintField } from '../projects/blueprints/fields.js';
import { IProjectDetailsProvider } from '../projects/projectDetailsProvider.js';
import { AntlersNode, ParameterNode } from '../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../suggestions/suggestionRequest.js';
import { HtmlClassParameter, HtmlStyleParameter } from './htmlCompat/parameters.js';
import { IModifier } from './modifierTypes.js';
import { Scope } from './scope/scope.js';
import { IReportableError, ISpecialResolverResults } from "./types.js";

interface IParameterAttribute {
    /**
     * The user supplied parameter name.
     */
    name: string;
    /**
     * The user supplied parameter value.
     */
    value: string;
    /**
     * The offset at which the parameter value starts.
     */
    contentStartsAt: number;
    /**
     * The start offset of the entire parameter.
     */
    startOffset: number;
    /**
     * The end offset of the entire parameter.
     */
    endOffset: number;
    /**
     * Indicates if the parameter contains dynamic bindings (variable reference).
     *
     * An example is ':src="variable"'.
     */
    isDynamicBinding: boolean;
    /**
     * Indicates if the parameter name contains multiple pieces.
     *
     * An example is 'title:contains'.
     */
    isCompound: boolean;
    /**
     * Inddicates if the parameter value contains any interpolation ranges.
     */
    containsInterpolation: boolean;
    /**
     * A list of all interpolation ranges within the parameter's value.
     */
    interpolations: IVariableInterpolation[];
    /**
     * Indicates if the parameter can be associated with a known modifier instance.
     */
    isModifier: boolean;
    /**
     * The associated modifier instance, if available.
     */
    modifier: IModifier | null;
}

interface IVariableInterpolation {
    /**
     * The user-supplied value of the interpolation range.
     */
    value: string;
    /**
     * The start offset of the interpolation range.
     */
    startOffset: number;
    /**
     * The end offset of the interpolation range.
     */
    endOffset: number;
    /**
     * A list of all symbols that represent the full range.
     */
    symbols: AntlersNode[];
}

interface IProviderCompletionResult {
    items: CompletionItem[];
    isExclusive: boolean;
}

interface IAntlersParameter {
    /**
     * The name of the parameter.
     */
    name: string;
    /**
     * Indicates if the parameter is required to use the tag.
     */
    isRequired: boolean;
    /**
     * A user-friendly description of the parameter.
     */
    description: string;
    /**
     * Indicates whether the parameter was dynamically created, or not.
     */
    isDynamic: boolean;
    /**
     * A list of optional aliases for the parameter.
     */
    aliases: string[] | null;
    /**
     * Indicates if the parameter accepts variable interpolation.
     *
     * Example: some="{value}"
     */
    acceptsVariableInterpolation: boolean;
    /**
     * Indicates if the parameter accepts variable references.
     *
     * Example: :some="value"
     */
    allowsVariableReference: boolean;
    /**
     * A list of expected types for the parameter.
     *
     * Allowed values are:
     *   *       - Any
     *   string  - string
     *   date    - date
     *   number  - numeric
     *   array   - array
     *   boolean - boolean
     */
    expectsTypes: string[];
    /**
     * Provides an opportunity to report any errors with the parameter's contents.
     *
     * @param {AntlersNode} symbol The symbol being analyzed.
     * @param {ParameterNode} parameter The parameter being analyzed.
     */
    validate?(symbol: AntlersNode, parameter: ParameterNode): IReportableError[];
    documentationLink?: string;
    docLinkName?: string;
    providesDocumentation?(params: ISuggestionRequest): string
}

const DnyamicParameter: IAntlersParameter = {
    name: "dynamic",
    acceptsVariableInterpolation: false,
    aliases: [],
    allowsVariableReference: true,
    description: "",
    expectsTypes: ["string", "number", "array", "boolean"],
    isRequired: false,
    isDynamic: true,
};

function dynamicParameter(name: string): IAntlersParameter {
    if (name == 'class') {
        return HtmlClassParameter;
    } else if (name == 'style') {
        return HtmlStyleParameter;
    }

    return {
        name: name,
        acceptsVariableInterpolation: false,
        aliases: [],
        allowsVariableReference: true,
        description: "",
        expectsTypes: ["string", "number", "array"],
        isRequired: false,
        isDynamic: true,
    };
}

interface IParameterSearchResult {
    inParameter: boolean;
    param: IParameterAttribute | null;
}

interface IRuntimeVariableType {
    /**
     * An inferred value type.
     */
    assumedType: string;
    /**
     * Indicates if the represented variable references a collection.
     */
    doesReferenceCollection: boolean;
    /**
     * A list of all referenced blueprint fields.
     */
    referencedFields: IBlueprintField[];
    /**
     * The primary reference field, if available.
     */
    referenceField: IBlueprintField | null;
    /**
     * A list of a supplemental fields, if applicable.
     */
    supplementedFields: IBlueprintField[] | null;
    /**
     * A list of all known referenced collection names.
     */
    collectionReferences: string[];
    /**
     * Indicates if the represented variable references blueprints.
     */
    referencesBlueprints: boolean;
}

interface ICompletionResult {
    /**
     * A list of completion items to use, or merge in.
     */
    items: CompletionItem[];
    /**
     * Indicates if the items should be used exclusively.
     */
    isExclusiveResult: boolean;
    /**
     * Indicates if the engine should continue its default analysis.
     *
     * Internal property.
     */
    analyzeDefaults: boolean;
}

function resultList(items: string[]): ICompletionResult {
    const completionItems: CompletionItem[] = [];

    for (let i = 0; i < items.length; i++) {
        completionItems.push({
            label: items[i],
            kind: CompletionItemKind.Field,
        });
    }

    return exclusiveResult(completionItems);
}

function exclusiveResultList(items: string[]): ICompletionResult {
    const completionItems: CompletionItem[] = [];

    for (let i = 0; i < items.length; i++) {
        completionItems.push({
            label: items[i],
            kind: CompletionItemKind.Field,
        });
    }

    return exclusiveResult(completionItems);
}

function exclusiveResult(items: CompletionItem[]): ICompletionResult {
    return {
        items: items,
        isExclusiveResult: true,
        analyzeDefaults: false,
    };
}

function nonExclusiveResult(items: CompletionItem[]): ICompletionResult {
    return {
        items: items,
        isExclusiveResult: false,
        analyzeDefaults: true,
    };
}

const EmptyCompletionResult: ICompletionResult = {
    items: [],
    isExclusiveResult: false,
    analyzeDefaults: true,
};

interface IAntlersTag {
    /**
     * The name of the tag. Tag names including the ':' character are acceptable.
     */
    tagName: string;
    /**
     * Indicates if the tag must be closed.
     */
    requiresClose: boolean;
    /**
     * If requiresClose is false, this can be used to indicate that the tag
     * can be used like a variable, but it also acceptable to use a
     * closing tag if the tag supports arbitrary user content.
     */
    allowsContentClose: boolean;
    /**
     * Indicates if the tag allows arbitrary user parameters.
     *
     * Typically used if the tag performs filtering based on dynamic parameters,
     * or to allow the template developer to pass-thru CSS styles and classes.
     */
    allowsArbitraryParameters: boolean;
    /**
     * When true, the scope engine will supply the tag instance with the
     * previous scope's variables, lists, and any nested scopes.
     */
    injectParentScope: boolean;
    /**
     * A list of acceptable Antlers tag parmaeters.
     */
    parameters: IAntlersParameter[];
    /**
     * Indicates if this tag should be included in the completions result.
     *
     * Typically used to hide an alias from the completions list, but allow
     * the internal engines to provide analysis and language features
     * when they are encountered. Examples are the 'member:' tags.
     */
    hideFromCompletions: boolean;
    introducedIn: string | null;
    /**
     * Allows the tag implementor to inject data into the active scope.
     *
     * Implementations must always return the modified scope to use.
     *
     * @param {ISyAntlersNodembol} symbol The active symbol adjusting scope.
     * @param {Scope} scope The active scope.
     */
    augmentScope?(symbol: AntlersNode, scope: Scope): Scope;
    /**
     * Provides an opportunity for tag authors to suggest alternative parameter names.
     *
     * Useful for commonly confused tags, or common typos.
     *
     * @param {string} unknown The name of the unknown parameter.
     */
    suggestAlternativeParams?(unknown: string): string[];
    /**
     * Provides an opportunity for tag authors to inspect the current
     * scope, as well as details about how the user is writing the
     * template code, to determine if the tag should be closed.
     *
     * @param {AntlersNode} symbol The symbol being analyzed with respect to the tag.
     */
    requiresCloseResolver?(symbol: AntlersNode): boolean;
    /**
     * Provides an opportunity to return a dynamic parameter instance
     * to the internal engines when an unknown parameter is found.
     *
     * @param {AntlersNode} symbol The active symbol being analyzed.
     * @param {string} paramName The encountered parameter name.
     */
    resolveDynamicParameter?(
        symbol: AntlersNode | null, paramName: string): IAntlersParameter | null;
    /**
     * Allows tag authors to control what items are presented to the user when
     * a completion request is triggered within an Antlers parameter.
     *
     * @param {IAntlersParameter} parameter The active Antlers parameter.
     * @param {ISuggestionRequest} params The original suggestion request.
     */
    resovleParameterCompletionItems?(parameter: IAntlersParameter, params: ISuggestionRequest): ICompletionResult | null;
    /**
     * Allows tag authors to contribute to the completions list within the current tag context.
     *
     * @param {ISuggestionRequest} params The original suggestion request.
     */
    resolveCompletionItems?(params: ISuggestionRequest): ICompletionResult;
    /**
     * An internal method to resolve special symbol contexts to guide deeper analysis.
     *
     * @param {AntlersNode} context The active symbol being analyzed.
     * @param {IProjectDetailsProvider} project The active Statamic project.
     */
    resolveSpecialType?(context: AntlersNode, project: IProjectDetailsProvider): ISpecialResolverResults;
    resolveDocumentation?(params?: ISuggestionRequest): string
}

interface ITagMethod {
    methodName: string;
    requiresClose: boolean;
}

export {
    IAntlersTag,
    IProviderCompletionResult,
    IAntlersParameter,
    exclusiveResultList,
    resultList,
    ICompletionResult,
    IRuntimeVariableType,
    dynamicParameter,
    EmptyCompletionResult,
    exclusiveResult,
    nonExclusiveResult
};