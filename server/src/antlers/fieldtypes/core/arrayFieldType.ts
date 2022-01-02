import { IFieldtypeInjection } from '../../../projects/fieldsets/fieldtypeInjection';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { Scope } from '../../scope/scope';
import { makeArrayVariables } from '../../variables/arrayVariables';
import { makeLoopVariables } from '../../variables/loopVariables';

const ArrayFieldType: IFieldtypeInjection = {
    name: 'array',
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        scope.addVariables(makeArrayVariables(symbol));
        scope.addVariables(makeLoopVariables(symbol));
    }
};

export default ArrayFieldType;
