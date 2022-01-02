import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { Scope } from '../../../scope/scope';
import { IAntlersTag } from "../../../tagManager";

const ThemeOutput: IAntlersTag = {
    tagName: "theme:output",
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: true,
    requiresClose: false,
    injectParentScope: false,
    parameters: [
        {
            isRequired: true,
            allowsVariableReference: true,
            acceptsVariableInterpolation: false,
            aliases: [],
            name: "src",
            description: "The path to the file",
            expectsTypes: ["string"],
            isDynamic: false,
        },
        {
            isRequired: false,
            allowsVariableReference: true,
            acceptsVariableInterpolation: false,
            aliases: [],
            name: "as",
            description: "An optional alias for the contents variable",
            expectsTypes: ["string"],
            isDynamic: false,
        },
    ],
    augmentScope: (node: AntlersNode, scope: Scope) => {
        if (node.isClosedBy != null) {
            const param = node.findParameter("as");

            if (param != null) {
                scope.addVariable({
                    name: param.value,
                    dataType: "string",
                    sourceField: null,
                    sourceName: "*internal.theme.context",
                    introducedBy: node,
                });
            } else {
                scope.addVariable({
                    name: "output_contents",
                    dataType: "string",
                    sourceField: null,
                    sourceName: "*internal.theme.context",
                    introducedBy: node,
                });
            }
        }

        return scope;
    },
};

export default ThemeOutput;
