import { CompletionItem } from 'vscode-languageserver';
import { IBlueprintField } from '../../../projects/blueprints/fields';
import { IFieldtypeInjection } from '../../../projects/fieldsets/fieldtypeInjection';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { Scope } from '../../scope/scope';
import { makeLoopVariables } from '../../variables/loopVariables';
import { makeReplicatorVariables } from '../../variables/replicatorVariables';

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
