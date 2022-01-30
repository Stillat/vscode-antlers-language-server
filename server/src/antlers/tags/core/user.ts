import {
    CompletionItem,
    CompletionItemKind,
} from "vscode-languageserver-types";
import { makeTagDoc } from '../../../documentation/utils';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { formatSuggestionList } from "../../../suggestions/fieldFormatter";
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { tagToCompletionItem } from '../../documentedLabel';
import { Scope } from '../../scope/scope';
import {
    EmptyCompletionResult,
    exclusiveResult,
    IAntlersParameter,
    IAntlersTag,
} from "../../tagManager";
import UserCan from './userCan';
import UserCant from './userCant';
import { UserForgotPasswordForm } from './userForgotPasswordForm';
import UserIs from './userIs';
import UserIsnt from './userIsnt';
import UserLogout from './userLogout';
import UserLogoutUrl from './userLogoutUrl';
import UserNotIn from './userNotIn';
import { UserPasswordReset } from './userPasswordReset';
import UserProfile from './userProfile';
import { UserProfileParameters } from './userProfileParameters';
import { UserRegister } from './userRegister';

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
            'The `user` tag provides access to the currently logged in user information, or for a specific user when using the `id`, `email`, or `field` parameter',
            null
        );
    }
};

export default User;
