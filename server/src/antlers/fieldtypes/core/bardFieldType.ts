import { CompletionItem } from 'vscode-languageserver-types';
import { IBlueprintField } from '../../../projects/blueprints/fields.js';
import { IFieldtypeInjection } from '../../../projects/fieldsets/fieldtypeInjection.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { Scope } from '../../scope/scope.js';

const BardFieldType: IFieldtypeInjection = {
    name: 'bard',
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        scope.addVariable({ name: 'type', dataType: 'string', sourceField: null, sourceName: '*internal.bard', introducedBy: symbol });
    },
    injectCompletions: (params: ISuggestionRequest, blueprintField: IBlueprintField, symbol: AntlersNode) => {
        const items: CompletionItem[] = [];

        return items;
    }
};

export default BardFieldType;
