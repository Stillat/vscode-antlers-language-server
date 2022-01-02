import { createDefinitionAlias } from '../alias';
import User from './user';
import UserCan from './userCan';
import UserIn from './userIn';
import UserIs from './userIs';
import UserIsnt from './userIsnt';
import UserLogout from './userLogout';
import UserLogoutUrl from './userLogoutUrl';
import UserNotIn from './userNotIn';
import UserProfile from './userProfile';

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

export {
    MemberTag, MemberIs, MemberIsnt, MemberProfile,
    MemberCan, MemberLogout, MemberLogoutUrl, MemberIn, MemberNotIn
};
