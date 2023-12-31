import { IFieldtypeInjection } from '../../../projects/fieldsets/fieldtypeInjection.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { Scope } from '../../scope/scope.js';
import { makeArrayVariables } from '../../variables/arrayVariables.js';
import { makeAssetVariables } from '../../variables/assetVariables.js';

const AssetsFieldType: IFieldtypeInjection = {
    name: 'assets',
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        scope.addVariables(makeArrayVariables(symbol));
        scope.addVariables(makeAssetVariables(symbol));
    }
};

export default AssetsFieldType;

