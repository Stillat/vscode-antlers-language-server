import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { trimLeft } from '../../../../utils/strings';
import { dynamicParameter, IAntlersParameter } from '../../../tagManager';

export function resolveConditionalParmaters(symbol: AntlersNode, paramName: string): IAntlersParameter | null {
    let checkName = trimLeft(paramName, ':');

    if (checkName.includes(':')) {
        checkName = checkName.split(':')[0];
    }

    if (checkName == 'status' || checkName == 'taxonomy' || symbol.currentScope != null && symbol.currentScope.containsReference(checkName)) {
        return dynamicParameter(paramName);
    }

    return null;
}
