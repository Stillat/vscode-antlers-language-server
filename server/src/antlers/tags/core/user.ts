import {
    CompletionItem,
    CompletionItemKind,
} from "vscode-languageserver-types";
import { makeTagDoc } from '../../../documentation/utils.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { formatSuggestionList } from "../../../suggestions/fieldFormatter.js";
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { tagToCompletionItem } from '../../documentedLabel.js';
import { Scope } from '../../scope/scope.js';
import {
    EmptyCompletionResult,
    exclusiveResult,
    IAntlersParameter,
    IAntlersTag,
} from "../../tagManager.js";
import UserCan from './userCan.js';
import UserCant from './userCant.js';
import { UserForgotPasswordForm } from './userForgotPasswordForm.js';
import UserIs from './userIs.js';
import UserIsnt from './userIsnt.js';
import UserLogout from './userLogout.js';
import UserLogoutUrl from './userLogoutUrl.js';
import UserNotIn from './userNotIn.js';
import UserPasswordForm from './userPasswordForm.js';
import { UserPasswordReset } from './userPasswordReset.js';
import UserProfile from './userProfile.js';
import UserProfileForm from './userProfileForm.js';
import { UserProfileParameters } from './userProfileParameters.js';
import { UserRegister } from './userRegister.js';

const UserTagCompletionItems: CompletionItem[] = [
    tagToCompletionItem(UserIs),
    tagToCompletionItem(UserNotIn),
    tagToCompletionItem(UserIsnt),
    tagToCompletionItem(UserProfile),
    tagToCompletionItem(UserCan),
    tagToCompletionItem(UserCant),
    tagToCompletionItem(UserForgotPasswordForm),
    tagToCompletionItem(UserLogout),
    tagToCompletionItem(UserLogoutUrl),
    tagToCompletionItem(UserRegister),
    tagToCompletionItem(UserPasswordReset),
    tagToCompletionItem(UserProfileForm),
    tagToCompletionItem(UserPasswordForm),
];

const User: IAntlersTag = {
    tagName: "user",
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    parameters: UserProfileParameters,
    introducedIn: null,
    resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
        if (
            params.isPastTagPart == false &&
            params.currentNode != null &&
            params.currentNode.methodIsEmptyOrMatches("profile")
        ) {
            if (parameter.name == "field") {
                return exclusiveResult(
                    formatSuggestionList(params.project.getUserFields())
                );
            }
        }

        return EmptyCompletionResult;
    },
    augmentScope: (node: AntlersNode, scope: Scope) => {
        if (node.methodIsEmptyOrMatches("profile")) {
            scope.injectUserFields(node);
        }

        return scope;
    },
    resolveCompletionItems: (params: ISuggestionRequest) => {
        if (
            (params.leftWord == "user" ||
                params.leftWord == "/user" ||
                params.leftWord == "member" ||
                params.leftWord == "/member") &&
            params.leftChar == ":"
        ) {
            return exclusiveResult(UserTagCompletionItems);
        }

        return EmptyCompletionResult;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'user Tag',
            'The `user` tag provides access to the currently logged in user information, or for a specific user when using the `id`, `email`, or `field` parameter.',
            null
        );
    }
};

export default User;
