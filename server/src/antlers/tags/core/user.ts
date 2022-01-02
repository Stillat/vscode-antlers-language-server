import {
	CompletionItem,
	CompletionItemKind,
} from "vscode-languageserver-types";
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { formatSuggestionList } from "../../../suggestions/fieldFormatter";
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { Scope } from '../../scope/scope';
import {
	EmptyCompletionResult,
	exclusiveResult,
	IAntlersParameter,
	IAntlersTag,
} from "../../tagManager";

const UserTagCompletionItems: CompletionItem[] = [
	{ label: "is", kind: CompletionItemKind.Text },
	{ label: "not_in", kind: CompletionItemKind.Text },
	{ label: "in", kind: CompletionItemKind.Text },
	{ label: "isnt", kind: CompletionItemKind.Text },
	{ label: "profile", kind: CompletionItemKind.Text },
	{ label: "can", kind: CompletionItemKind.Text },
	{ label: "forgot_password_form", kind: CompletionItemKind.Text },
	{ label: "logout", kind: CompletionItemKind.Text },
	{ label: "login_form", kind: CompletionItemKind.Text },
	{ label: "logout_url", kind: CompletionItemKind.Text },
	{ label: "register_form", kind: CompletionItemKind.Text },
	{ label: "reset_password_form", kind: CompletionItemKind.Text },
];

const UserProfileParameters: IAntlersParameter[] = [
	{
		isRequired: false,
		acceptsVariableInterpolation: false,
		allowsVariableReference: true,
		aliases: [],
		name: "id",
		description: "The user ID to fetch",
		expectsTypes: ["string"],
		isDynamic: false,
	},
	{
		isRequired: false,
		acceptsVariableInterpolation: false,
		allowsVariableReference: true,
		aliases: [],
		name: "email",
		description: "The email address to find the user by",
		expectsTypes: ["string"],
		isDynamic: false,
	},
	{
		isRequired: false,
		acceptsVariableInterpolation: false,
		allowsVariableReference: true,
		aliases: [],
		name: "field",
		description: "The field to fetch the user by",
		expectsTypes: ["string"],
		isDynamic: false,
	},
	{
		isRequired: false,
		acceptsVariableInterpolation: false,
		allowsVariableReference: true,
		aliases: [],
		name: "value",
		description: "The value to search for",
		expectsTypes: ["string"],
		isDynamic: false,
	},
];

export { UserProfileParameters };

const User: IAntlersTag = {
	tagName: "user",
	hideFromCompletions: false,
	requiresClose: true,
	injectParentScope: false,
	allowsContentClose: false,
	allowsArbitraryParameters: false,
	parameters: UserProfileParameters,
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
};

export default User;
