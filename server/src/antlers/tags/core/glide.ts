import { CompletionItem } from "vscode-languageserver-types";
import { makeTagDoc } from '../../../documentation/utils.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { tagToCompletionItem } from '../../documentedLabel.js';
import { Scope } from '../../scope/scope.js';
import {
    EmptyCompletionResult,
    exclusiveResult,
    IAntlersTag,
    ICompletionResult,
} from "../../tagManager.js";
import { makeGlideVariables } from "../../variables/glideVariables.js";
import GlideBatch from './glideBatch.js';
import GlideDataUrl from './glideDataUrl.js';
import { GlideParameters, resolveGlideParameterCompletions } from './glideParameters.js';

const GlideCompletionItems: CompletionItem[] = [
    tagToCompletionItem(GlideBatch),
    tagToCompletionItem(GlideDataUrl)
];

const Glide: IAntlersTag = {
    tagName: "glide",
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    injectParentScope: false,
    requiresClose: false,
    parameters: GlideParameters,
    introducedIn: null,
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariables(makeGlideVariables(node));

        return scope;
    },
    resovleParameterCompletionItems: resolveGlideParameterCompletions,
    resolveCompletionItems: (params: ISuggestionRequest): ICompletionResult => {
        if (
            params.isPastTagPart == false &&
            (params.leftWord == "glide" || params.leftWord == "/glide") &&
            params.leftChar == ":"
        ) {
            return exclusiveResult(GlideCompletionItems);
        }

        return EmptyCompletionResult;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'glide Tag',
            'The `glide` tag is used to manipulate images on the fly. Image manipulations may include resizing, cropping, or adjusting sharpness and constrast, amongst many others.',
            'https://statamic.dev/tags/glide'
        );
    }
};

export default Glide;
