import { makeTagDoc, makeTagDocWithCodeSample } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { createDefinitionAlias } from '../alias.js';
import User from './user.js';
import UserCan from './userCan.js';
import UserIn from './userIn.js';
import UserIs from './userIs.js';
import UserIsnt from './userIsnt.js';
import UserLogout from './userLogout.js';
import UserLogoutUrl from './userLogoutUrl.js';
import UserNotIn from './userNotIn.js';
import UserProfile from './userProfile.js';

const MemberTag = createDefinitionAlias(User, 'member'),
    MemberIs = createDefinitionAlias(UserIs, 'member:is'),
    MemberIsnt = createDefinitionAlias(UserIsnt, 'member:isnt'),
    MemberProfile = createDefinitionAlias(UserProfile, 'member:profile'),
    MemberCan = createDefinitionAlias(UserCan, 'member:can'),
    MemberLogout = createDefinitionAlias(UserLogout, 'member:logout'),
    MemberLogoutUrl = createDefinitionAlias(UserLogoutUrl, 'member:logout_url'),
    MemberIn = createDefinitionAlias(UserIn, 'member:in'),
    MemberNotIn = createDefinitionAlias(UserNotIn, 'member:not_in');

MemberTag.hideFromCompletions = true;

MemberTag.resolveDocumentation = (params?: ISuggestionRequest) => {
    return makeTagDoc(
        'member Tag',
        'The `member` tag provides access to the currently logged in user information, or for a specific user when using the `id`, `email`, or `field` parameter',
        null
    );
};

MemberIs.resolveDocumentation = (params?: ISuggestionRequest) => {
    return makeTagDoc(
        'member:is Tag',
        'The `member:is` tag can be used to check whether the currently authenticated user has one or more roles.',
        'https://statamic.dev/tags/user-is'
    );
};

MemberIsnt.resolveDocumentation = (params?: ISuggestionRequest) => {
    return makeTagDoc(
        'member:isnt Tag',
        'The `member:isnt` tag can be used to check whether the currently authenticated user does not have one or more roles.',
        'https://statamic.dev/tags/user-is#isnt'
    );
};

MemberProfile.resolveDocumentation = (params?: ISuggestionRequest) => {
    return makeTagDoc(
        'member:profile Tag',
        'The `member:profile` tag provides access to the currently logged in user information, or for a specific user when using the `id`, `email`, or `field` parameter',
        null
    );
};

MemberCan.resolveDocumentation = (params?: ISuggestionRequest) => {
    return makeTagDoc(
        'member:can Tag',
        'The `member:can` tag is used to check if the currently authenticated user has a specific set of permissions. When used as a tag pair, the tag contents will only be rendered if the user has the specified permissions.',
        'https://statamic.dev/tags/user-can'
    );
};

MemberLogout.resolveDocumentation = (params?: ISuggestionRequest) => {
    return makeTagDoc(
        'member:logout Tag',
        'The `member:logout` tag will sign out the currently authenticated user. An optional `redirect` parameter may be used to redirect the visitor to a different page after being logged out.',
        'https://statamic.dev/tags/user-logout'
    );
};

MemberLogoutUrl.resolveDocumentation = (params?: ISuggestionRequest) => {
    return makeTagDocWithCodeSample(
        'member:logout_url',
        'The `member:logout_url` tag can be used to retrieve the URL that will sign the current user out.',
        `<a href="{{ member:logout_url }}">Log out</a>`,
        'https://statamic.dev/tags/user-logout_url'
    );
};

MemberIn.resolveDocumentation = (params?: ISuggestionRequest) => {
    return makeTagDoc(
        'member:in Tag',
        'The `member:in` tag can be used to check if the currently authenticated user belongs to one or more user groups. When used as a tag pair, the tag contents will only be rendered if the user belongs to the specified groups.',
        'https://statamic.dev/tags/user-in'
    );
};

MemberNotIn.resolveDocumentation = (params?: ISuggestionRequest) => {
    return makeTagDoc(
        'member:not_in Tag',
        'The `member:not_in` tag can be used to check if the currently authenticated user does not belong to one or more user groups. When used as a tag pair, the tag contents will be rendered if the user does not belong to the specified groups.',
        'https://statamic.dev/tags/user-in#not-in'
    );
};

export {
    MemberTag, MemberIs, MemberIsnt, MemberProfile,
    MemberCan, MemberLogout, MemberLogoutUrl, MemberIn, MemberNotIn
};
