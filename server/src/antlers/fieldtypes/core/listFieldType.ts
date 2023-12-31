import { IFieldtypeInjection } from '../../../projects/fieldsets/fieldtypeInjection.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { Scope } from '../../scope/scope.js';
import { makeArrayVariables } from '../../variables/arrayVariables.js';
import { makeLoopVariables } from '../../variables/loopVariables.js';

const ListFieldtype: IFieldtypeInjection = {
    name: 'list',
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        scope.addVariables(makeArrayVariables(symbol));
        scope.addVariables(makeLoopVariables(symbol));
    }
};

export default ListFieldtype;
