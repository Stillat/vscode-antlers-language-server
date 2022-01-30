import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { HandleParams } from "./parameterCompletions";

const IgnoreFormTagParts: string[] = [
    "set",
    "create",
    "errors",
    "success",
    "submissions",
    "submission",
];

export function getFormHandle(node: AntlersNode): string {
    if (node.reference != null && "tagPart" in node.reference) {
        const nodeRef = node.reference as AntlersNode;

        if (nodeRef.nameMatches("form:set")) {
            return getFormHandle(nodeRef);
        }
    }

    const handleParam = node.findAnyParameter(HandleParams);

    const nodeMethodName = node.getMethodNameValue();

    if (
        nodeMethodName != null &&
        IgnoreFormTagParts.includes(nodeMethodName) == false
    ) {
        return nodeMethodName as string;
    }

    if (typeof handleParam !== "undefined" && handleParam !== null) {
        if (handleParam.containsSimpleValue()) {
            return handleParam.value;
        }
    }

    return "";
}
