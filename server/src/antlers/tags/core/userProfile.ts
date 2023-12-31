import { makeTagDoc } from '../../../documentation/utils.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { formatSuggestionList } from "../../../suggestions/fieldFormatter.js";
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { Scope } from '../../scope/scope.js';
import {
    EmptyCompletionResult,
    exclusiveResult,
    IAntlersParameter,
    IAntlersTag,
} from "../../tagManager.js";
import { UserProfileParameters } from './userProfileParameters.js';

const UserProfile: IAntlersTag = {
    tagName: "user:profile",
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    parameters: UserProfileParameters,
    introducedIn: null,
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.injectBlueprint(node, "user");

        return scope;
    },
    resovleParameterCompletionItems: (
        parameter: IAntlersParameter,
        params: ISuggestionRequest
    ) => {
        if (parameter.name == "field") {
            return exclusiveResult(
                formatSuggestionList(params.project.getUserFields())
            );
        }

        return EmptyCompletionResult;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'user:profile Tag',
            'The `user:profile` tag provides access to the currently logged in user information, or for a specific user when using the `id`, `email`, or `field` parameter.',
            null
        );
    }
};

export default UserProfile;
