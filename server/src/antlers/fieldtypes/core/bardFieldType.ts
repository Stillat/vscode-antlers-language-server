import { CompletionItem } from 'vscode-languageserver-types';
import { IBlueprintField } from '../../../projects/blueprints/fields';
import { IFieldtypeInjection } from '../../../projects/fieldsets/fieldtypeInjection';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { Scope } from '../../scope/scope';

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
