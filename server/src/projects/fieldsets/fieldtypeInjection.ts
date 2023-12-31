import { CompletionItem } from 'vscode-languageserver';;
import { Scope } from '../../antlers/scope/scope.js';
import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../suggestions/suggestionRequest.js';
import { IBlueprintField } from '../blueprints/fields.js';

export interface IFieldtypeInjection {
    name: string,
    augmentScope(symbol: AntlersNode, scope: Scope): void,
    injectCompletions?(params: ISuggestionRequest, blueprintField: IBlueprintField, symbol: AntlersNode): CompletionItem[]
}
