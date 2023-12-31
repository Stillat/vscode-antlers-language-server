import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { dynamicParameter, IAntlersParameter } from "../tagManager.js";

export function returnDynamicParameter(node: AntlersNode, paramName: string): IAntlersParameter | null {
    if (paramName.trim().length > 0) {
        return dynamicParameter(paramName);
    }

    return null;
}
