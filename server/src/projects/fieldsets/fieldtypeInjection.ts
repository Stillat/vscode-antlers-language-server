import { CompletionItem } from 'vscode-languageserver';
import { Scope } from '../../antlers/scope/scope';
import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../suggestions/suggestionRequest';
import { IBlueprintField } from '../blueprints/fields';

export interface IFieldtypeInjection {
    name: string,
    augmentScope(symbol: AntlersNode, scope: Scope): void,
    injectCompletions?(params: ISuggestionRequest, blueprintField: IBlueprintField, symbol: AntlersNode): CompletionItem[]
}
