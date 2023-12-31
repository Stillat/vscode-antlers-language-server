import { AntlersNode } from '../../../../runtime/nodes/abstractNode.js';
import { trimLeft } from '../../../../utils/strings.js';
import { dynamicParameter, IAntlersParameter } from '../../../tagManager.js';

export function resolveConditionalParmaters(symbol: AntlersNode, paramName: string): IAntlersParameter | null {
    if (symbol == null) {
        return null;
    }

    let checkName = trimLeft(paramName, ':');

    if (checkName.includes(':')) {
        checkName = checkName.split(':')[0];
    }

    if (checkName == 'status' || checkName == 'taxonomy' || symbol.currentScope != null && symbol.currentScope.containsReference(checkName)) {
        return dynamicParameter(paramName);
    }

    return null;
}
