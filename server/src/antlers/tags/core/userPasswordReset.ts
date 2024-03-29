import { makeTagDoc } from '../../../documentation/utils.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { Scope } from '../../scope/scope.js';
import { IAntlersTag } from "../../tagManager.js";
import { createDefinitionAlias } from "../alias.js";
import { returnDynamicParameter } from "../dynamicParameterResolver.js";

const UserPasswordReset: IAntlersTag = {
    tagName: "user:reset_password_form",
    allowsArbitraryParameters: true,
    allowsContentClose: false,
    requiresClose: true,
    hideFromCompletions: false,
    injectParentScope: false,
    introducedIn: null,
    parameters: [
        {
            name: "redirect",
            description: "Where the user should be taken after submitting the form",
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: true,
            expectsTypes: ["string"],
            isDynamic: false,
            isRequired: false,
        },
    ],
    resolveDynamicParameter: returnDynamicParameter,
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariables([
            {
                name: "success",
                dataType: "boolean",
                sourceField: null,
                sourceName: "*internal.user.password_reset",
                introducedBy: node,
            },
            {
                name: "url_invalid",
                dataType: "boolean",
                sourceField: null,
                sourceName: "*internal.user.password_reset",
                introducedBy: node,
            },
            {
                name: "errors",
                dataType: "array",
                sourceField: null,
                sourceName: "*internal.user.password_reset",
                introducedBy: node,
            },
        ]);

        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'user:reset_password_form Tag',
            'The `user:reset_password_form` tag is used to quickly create password reset forms. Forms created with this tag should be displayed after a user has received and clicked a password reset email link.',
            'https://statamic.dev/tags/user-reset_password_form'
        );
    }
};

const MemberPasswordReset = createDefinitionAlias(
    UserPasswordReset,
    "member:reset_password_form"
);

MemberPasswordReset.resolveDocumentation = (params?: ISuggestionRequest) => {
    return makeTagDoc(
        'member:reset_password_form Tag',
        'The `member:reset_password_form` tag is used to quickly create password reset forms. Forms created with this tag should be displayed after a user has received and clicked a password reset email link.',
        'https://statamic.dev/tags/user-reset_password_form'
    );
};

export { UserPasswordReset, MemberPasswordReset };
