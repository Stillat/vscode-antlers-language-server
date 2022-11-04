import { IFieldtypeInjection } from '../../../projects/fieldsets/fieldtypeInjection';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { Scope } from '../../scope/scope';
import { makeArrayVariables } from '../../variables/arrayVariables';
import { makeAssetVariables } from '../../variables/assetVariables';

const AssetsFieldType: IFieldtypeInjection = {
    name: 'assets',
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        scope.addVariables(makeArrayVariables(symbol));
        scope.addVariables(makeAssetVariables(symbol));
    }
};

export default AssetsFieldType;

