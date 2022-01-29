import { makeTagDoc } from '../../../../documentation/utils';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { Scope } from '../../../scope/scope';
import { IAntlersTag } from "../../../tagManager";

const ThemeOutput: IAntlersTag = {
    tagName: "theme:output",
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: true,
    requiresClose: false,
    injectParentScope: false,
	introducedIn: null,
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
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'theme:output Tag',
            'The `theme:output` tag may be used to output the contents of any arbitrary file, relative to the site\'s `resources/` directory.',
            null
        );
    }
};

export default ThemeOutput;
