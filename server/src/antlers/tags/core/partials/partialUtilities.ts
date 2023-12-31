import { AntlersNode } from '../../../../runtime/nodes/abstractNode.js';

export function getViewName(node: AntlersNode) {
    if (node.getTagName() != "partial") {
        return null;
    }

    let partialName = "";

    if (node.hasMethodPart()) {
        partialName = node.getMethodNameValue();
    } else {
        const srcParam = node.findParameter("src");

        if (srcParam != null) {
            partialName = srcParam.value;
        }
    }

    return partialName;
}