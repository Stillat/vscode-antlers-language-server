import { CompletionItemKind } from "vscode-languageserver";
import { CompletionItem } from "vscode-languageserver-types";
import { parameterError } from "../../../diagnostics/utils";
import { makeTagDoc } from '../../../documentation/utils';
import { AntlersNode, ParameterNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { tagToCompletionItem } from '../../documentedLabel';
import { Scope } from '../../scope/scope';
import {
    EmptyCompletionResult,
    exclusiveResult,
    IAntlersTag,
    ICompletionResult,
} from "../../tagManager";
import { makeGlideVariables } from "../../variables/glideVariables";
import GlideBatch from './glideBatch';
import { GlideParameters, resolveGlideParameterCompletions } from './glideParameters';

const GlideCompletionItems: CompletionItem[] = [
    tagToCompletionItem(GlideBatch),
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
