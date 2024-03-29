import { makeTagDoc } from '../../../../documentation/utils.js';
import { IProjectDetailsProvider } from '../../../../projects/projectDetailsProvider.js';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from "../../../tagManager.js";

export class YieldContext {
    node: AntlersNode;

    constructor(node: AntlersNode) {
        this.node = node;
    }
}

const Yields: IAntlersTag = {
    tagName: "yields",
    hideFromCompletions: false,
    injectParentScope: false,
    allowsArbitraryParameters: false,
    allowsContentClose: true,
    parameters: [],
    introducedIn: null,
    requiresClose: false,
    resolveSpecialType: (node: AntlersNode, project: IProjectDetailsProvider) => {
        const context = new YieldContext(node);

        return {
            context: context,
            issues: [],
        };
    },
};

const Yield: IAntlersTag = {
    tagName: "yield",
    hideFromCompletions: false,
    injectParentScope: false,
    allowsArbitraryParameters: false,
    allowsContentClose: true,
    parameters: [],
    introducedIn: null,
    requiresClose: false,
    resolveSpecialType: (node: AntlersNode, project: IProjectDetailsProvider) => {
        const context = new YieldContext(node);

        return {
            context: context,
            issues: [],
        };
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'yield Tag',
            'The `yield` tag may be used to push rendered content to named regions within a template\'s structure.',
            'https://statamic.dev/tags/yield'
        );
    }
};

export { Yield, Yields };
