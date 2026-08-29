import { makeTagDoc } from '../../../documentation/utils.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { Scope } from '../../scope/scope.js';
import { IScopeVariable } from '../../scope/types.js';
import { IAntlersParameter, IAntlersTag } from '../../tagManager.js';
import { makeStandardFormVariables } from '../../variables/forms/standardFormVariables.js';
import { createDefinitionAlias } from '../alias.js';
import { UserRegister } from './userRegister.js';

interface IUserTagOptions {
    method: string;
    description: string;
    requiresClose: boolean;
    parameters?: IAntlersParameter[];
    scopeVariables?: Array<{ name: string; dataType: string }>;
    isForm?: boolean;
    allowsArbitraryParameters?: boolean;
}

const redirectParameter: IAntlersParameter = {
    name: 'redirect',
    description: 'The URL to visit after a successful request.',
    aliases: [],
    acceptsVariableInterpolation: true,
    allowsVariableReference: true,
    expectsTypes: ['string'],
    isDynamic: false,
    isRequired: false,
};

const errorRedirectParameter: IAntlersParameter = {
    name: 'error_redirect',
    description: 'The URL to visit after a failed request.',
    aliases: [],
    acceptsVariableInterpolation: true,
    allowsVariableReference: true,
    expectsTypes: ['string'],
    isDynamic: false,
    isRequired: false,
};

const allowRequestRedirectParameter: IAntlersParameter = {
    name: 'allow_request_redirect',
    description: 'Whether request parameters may override redirect values.',
    aliases: [],
    acceptsVariableInterpolation: false,
    allowsVariableReference: true,
    expectsTypes: ['boolean'],
    isDynamic: false,
    isRequired: false,
};

const standardFormParameters = [
    redirectParameter,
    errorRedirectParameter,
    allowRequestRedirectParameter,
];

function makeUserTag(options: IUserTagOptions): IAntlersTag {
    const tag: IAntlersTag = {
        tagName: `user:${options.method}`,
        hideFromCompletions: false,
        requiresClose: options.requiresClose,
        allowsContentClose: false,
        allowsArbitraryParameters: options.allowsArbitraryParameters ?? false,
        injectParentScope: false,
        introducedIn: null,
        parameters: options.parameters ?? [],
        resolveDocumentation: () => makeTagDoc(
            `user:${options.method} Tag`,
            options.description,
            'https://statamic.dev/tags/user'
        ),
    };

    if (options.isForm || (options.scopeVariables?.length ?? 0) > 0) {
        tag.augmentScope = (node: AntlersNode, scope: Scope) => {
            if (options.isForm) {
                scope.addVariables(makeStandardFormVariables(node));
            }

            if (options.scopeVariables != null) {
                const variables: IScopeVariable[] = options.scopeVariables.map((variable) => ({
                    name: variable.name,
                    dataType: variable.dataType,
                    sourceName: `*internal.user.${options.method}`,
                    sourceField: null,
                    introducedBy: node,
                }));

                scope.addVariables(variables);
            }

            return scope;
        };
    }

    return tag;
}

const UserRegistrationForm = createDefinitionAlias(UserRegister, 'user:registration_form');
UserRegistrationForm.resolveDocumentation = () => makeTagDoc(
    'user:registration_form Tag',
    'The `user:registration_form` tag is an alias of `user:register_form`.',
    'https://statamic.dev/tags/user-register_form'
);

const UserPasskeyForm = makeUserTag({
    method: 'passkey_form',
    description: 'The `user:passkey_form` tag exposes the URLs needed to register a passkey.',
    requiresClose: true,
    scopeVariables: [
        { name: 'passkey_options_url', dataType: 'string' },
        { name: 'passkey_verify_url', dataType: 'string' },
    ],
});

const UserPasskeys = makeUserTag({
    method: 'passkeys',
    description: 'The `user:passkeys` tag loops over the current user\'s registered passkeys.',
    requiresClose: true,
    scopeVariables: [
        { name: 'id', dataType: 'string' },
        { name: 'name', dataType: 'string' },
        { name: 'last_login', dataType: 'date' },
    ],
});

const UserDeletePasskeyForm = makeUserTag({
    method: 'delete_passkey_form',
    description: 'The `user:delete_passkey_form` tag renders a form that removes a registered passkey.',
    requiresClose: true,
    isForm: true,
    allowsArbitraryParameters: true,
    parameters: [
        {
            name: 'id',
            description: 'The ID of the passkey to remove.',
            aliases: [],
            acceptsVariableInterpolation: true,
            allowsVariableReference: true,
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: true,
        },
        redirectParameter,
    ],
});

const UserElevatedSessionForm = makeUserTag({
    method: 'elevated_session_form',
    description: 'The `user:elevated_session_form` tag renders the form used to confirm an elevated session.',
    requiresClose: true,
    isForm: true,
    allowsArbitraryParameters: true,
    scopeVariables: [
        { name: 'method', dataType: 'string' },
        { name: 'allow_passkey', dataType: 'boolean' },
        { name: 'resend_code_url', dataType: 'string' },
        { name: 'passkey_options_url', dataType: 'string' },
        { name: 'submit_url', dataType: 'string' },
    ],
});

const UserTwoFactorEnabled = makeUserTag({
    method: 'two_factor_enabled',
    description: 'The `user:two_factor_enabled` tag reports whether the current user has two-factor authentication enabled.',
    requiresClose: false,
});

const UserTwoFactorChallengeForm = makeUserTag({
    method: 'two_factor_challenge_form',
    description: 'The `user:two_factor_challenge_form` tag renders the two-factor login challenge form.',
    requiresClose: true,
    parameters: standardFormParameters,
    isForm: true,
    allowsArbitraryParameters: true,
});

const UserTwoFactorEnableForm = makeUserTag({
    method: 'two_factor_enable_form',
    description: 'The `user:two_factor_enable_form` tag renders the form that begins two-factor setup.',
    requiresClose: true,
    parameters: [redirectParameter, allowRequestRedirectParameter],
    isForm: true,
    allowsArbitraryParameters: true,
});

const UserTwoFactorSetupForm = makeUserTag({
    method: 'two_factor_setup_form',
    description: 'The `user:two_factor_setup_form` tag renders the form that confirms two-factor setup.',
    requiresClose: true,
    parameters: standardFormParameters,
    isForm: true,
    allowsArbitraryParameters: true,
    scopeVariables: [
        { name: 'qr_code', dataType: 'string' },
        { name: 'qr_code_url', dataType: 'string' },
        { name: 'secret_key', dataType: 'string' },
    ],
});

const UserTwoFactorRecoveryCodes = makeUserTag({
    method: 'two_factor_recovery_codes',
    description: 'The `user:two_factor_recovery_codes` tag loops over the current user\'s recovery codes.',
    requiresClose: true,
    scopeVariables: [{ name: 'code', dataType: 'string' }],
});

const UserTwoFactorRecoveryCodesDownloadUrl = makeUserTag({
    method: 'two_factor_recovery_codes_download_url',
    description: 'The `user:two_factor_recovery_codes_download_url` tag returns the recovery-code download URL.',
    requiresClose: false,
});

const UserResetTwoFactorRecoveryCodesForm = makeUserTag({
    method: 'reset_two_factor_recovery_codes_form',
    description: 'The `user:reset_two_factor_recovery_codes_form` tag renders the recovery-code reset form.',
    requiresClose: true,
    parameters: [redirectParameter, allowRequestRedirectParameter],
    isForm: true,
    allowsArbitraryParameters: true,
});

const UserDisableTwoFactorForm = makeUserTag({
    method: 'disable_two_factor_form',
    description: 'The `user:disable_two_factor_form` tag renders the form that disables two-factor authentication.',
    requiresClose: true,
    parameters: [redirectParameter, allowRequestRedirectParameter],
    isForm: true,
    allowsArbitraryParameters: true,
});

const userSecurityTags = [
    UserRegistrationForm,
    UserPasskeyForm,
    UserPasskeys,
    UserDeletePasskeyForm,
    UserElevatedSessionForm,
    UserTwoFactorEnabled,
    UserTwoFactorChallengeForm,
    UserTwoFactorEnableForm,
    UserTwoFactorSetupForm,
    UserTwoFactorRecoveryCodes,
    UserTwoFactorRecoveryCodesDownloadUrl,
    UserResetTwoFactorRecoveryCodesForm,
    UserDisableTwoFactorForm,
];

const memberSecurityTags = userSecurityTags.map((tag) => {
    const alias = createDefinitionAlias(tag, tag.tagName.replace(/^user:/, 'member:'));

    alias.resolveDocumentation = () => tag.resolveDocumentation?.().replace(/user:/g, 'member:') ?? '';

    return alias;
});

export {
    memberSecurityTags,
    UserDeletePasskeyForm,
    UserDisableTwoFactorForm,
    UserElevatedSessionForm,
    UserPasskeyForm,
    UserPasskeys,
    UserRegistrationForm,
    UserResetTwoFactorRecoveryCodesForm,
    userSecurityTags,
    UserTwoFactorChallengeForm,
    UserTwoFactorEnabled,
    UserTwoFactorEnableForm,
    UserTwoFactorRecoveryCodes,
    UserTwoFactorRecoveryCodesDownloadUrl,
    UserTwoFactorSetupForm,
};
