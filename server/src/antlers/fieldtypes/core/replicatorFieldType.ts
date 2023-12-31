import { CompletionItem } from 'vscode-languageserver';
import { IBlueprintField } from '../../../projects/blueprints/fields.js';
import { IFieldtypeInjection } from '../../../projects/fieldsets/fieldtypeInjection.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { Scope } from '../../scope/scope.js';
import { makeLoopVariables } from '../../variables/loopVariables.js';
import { makeReplicatorVariables } from '../../variables/replicatorVariables.js';

const ReplicatorFieldtype: IFieldtypeInjection = {
    name: 'replicator',
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        scope.addVariables(makeReplicatorVariables(symbol));
        scope.addVariables(makeLoopVariables(symbol));
    },
    injectCompletions: (params: ISuggestionRequest, blueprintField: IBlueprintField, symbol: AntlersNode) => {
        const items: CompletionItem[] = [];

        return items;
    }
};

export default ReplicatorFieldtype;
