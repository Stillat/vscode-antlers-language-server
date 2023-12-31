import { makeTagDoc } from '../../../../documentation/utils.js';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { Scope } from '../../../scope/scope.js';
import { IAntlersTag } from "../../../tagManager.js";
import { makeRoutableVariables } from "../../../variables/routeableVariables.js";

const NavBreadcrumbs: IAntlersTag = {
    tagName: "nav:breadcrumbs",
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    hideFromCompletions: false,
    introducedIn: null,
    injectParentScope: false,
    parameters: [
        {
            name: "include_home",
            description: "Whether to include the home page in the first level",
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            expectsTypes: ["boolean"],
            isDynamic: false,
            isRequired: false,
        },
        {
            name: "reverse",
            description: "Whether to reverse the order of links",
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            aliases: [],
            expectsTypes: ["boolean"],
            isRequired: false,
            isDynamic: false,
        },
        {
            name: "trim",
            description:
                "Whether to trim the whitespace after each iteration of the loop",
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            aliases: [],
            expectsTypes: ["boolean"],
            isDynamic: false,
            isRequired: false,
        },
    ],
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariables([
            {
                name: "is_current",
                dataType: "boolean",
                sourceName: "*internal.nav.breadcrumbs",
                sourceField: null,
                introducedBy: node,
            },
        ]);

        scope.addVariables(makeRoutableVariables(node));

        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'nav:breadcrumbs Tag',
            'The `nav:breadcrumbs` tag can be used to retrieve the URLs of all pages that make up the current URL back to the site\'s home page.',
            'https://statamic.dev/tags/nav-breadcrumbs'
        );
    }
};

export default NavBreadcrumbs;
