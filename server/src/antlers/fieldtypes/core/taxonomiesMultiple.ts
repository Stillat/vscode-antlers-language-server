import { IFieldtypeInjection } from '../../../projects/fieldsets/fieldtypeInjection';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { Scope } from '../../scope/scope';
import { makeArrayVariables } from '../../variables/arrayVariables';
import { makeLoopVariables } from '../../variables/loopVariables';
import { makeTermVariables } from '../../variables/termVariables';

const TaxonomiesMultipleFieldtype: IFieldtypeInjection = {
    name: 'taxonomies_multiple',
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        scope.addVariables(makeArrayVariables(symbol));
        scope.addVariables(makeLoopVariables(symbol));
        scope.addVariables(makeTermVariables(symbol));
    }
};

export default TaxonomiesMultipleFieldtype;
