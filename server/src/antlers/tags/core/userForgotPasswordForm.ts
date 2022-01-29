import { makeTagDoc } from '../../../documentation/utils';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { Scope } from '../../scope/scope';
import { IAntlersTag } from "../../tagManager";
import { createDefinitionAlias } from "../alias";
import { returnDynamicParameter } from "../dynamicParameterResolver";

const UserForgotPasswordForm: IAntlersTag = {
    tagName: "user:forgot_password_form",
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
                sourceName: "*internal.user.reset_password",
                introducedBy: node,
            },
            {
                name: "url_invalid",
                dataType: "boolean",
                sourceField: null,
                sourceName: "*internal.user.reset_password",
                introducedBy: node,
            },
            {
                name: "errors",
                dataType: "array",
                sourceField: null,
                sourceName: "*internal.user.reset_password",
                introducedBy: node,
            },
        ]);

        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'user:forgot_password_form Tag',
            'The `user:forgot_password_form` tag is used to quickly create a "forgot password" form for site users.',
            'https://statamic.dev/tags/user-forgot_password_form'
        );
    }
};

const MemberForgotPasswordForm = createDefinitionAlias(
    UserForgotPasswordForm,
    "member:forgot_password_form"
);

MemberForgotPasswordForm.resolveDocumentation = (params?: ISuggestionRequest) => {
    return makeTagDoc(
        'member:forgot_password_form Tag',
        'The `member:forgot_password_form` tag is used to quickly create a "forgot password" form for site users.',
        'https://statamic.dev/tags/user-forgot_password_form'
    );
};

export { UserForgotPasswordForm, MemberForgotPasswordForm };
