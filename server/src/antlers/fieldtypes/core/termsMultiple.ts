import { IFieldtypeInjection } from '../../../projects/fieldsets/fieldtypeInjection.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { Scope } from '../../scope/scope.js';
import { makeArrayVariables } from '../../variables/arrayVariables.js';
import { makeLoopVariables } from '../../variables/loopVariables.js';
import { makeTermVariables } from '../../variables/termVariables.js';

const TermsMultipleFieldtype: IFieldtypeInjection = {
    name: 'terms_multiple',
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        scope.addVariables(makeArrayVariables(symbol));
        scope.addVariables(makeLoopVariables(symbol));
        scope.addVariables(makeTermVariables(symbol));
    }
};

export default TermsMultipleFieldtype;
