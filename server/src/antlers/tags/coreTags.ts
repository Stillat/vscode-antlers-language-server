import Collection from "./core/collection/collection.js";
import Cache from "./core/cache.js";
import Dump from "./core/dump.js";
import Error404 from "./core/error404.js";
import Link from "./core/link.js";
import { Loop, RangeTag } from "./core/loop.js";
import Partial from "./core/partials/partial.js";
import CollectionCount from "./core/collection/count.js";
import Increment from "./core/increment.js";
import { Yield, Yields } from "./core/sections/yield.js";
import UserCan from "./core/userCan.js";
import UserLogout from "./core/userLogout.js";
import UserLogoutUrl from "./core/userLogoutUrl.js";
import { Switch, Rotate } from "./core/switch.js";
import OAuth from "./core/oauth.js";
import SessionDump from "./core/sessionDump.js";
import SessionSet from "./core/sessionSet.js";
import SessionForget from "./core/sessionForget.js";
import SessionFlush from "./core/sessionFlush.js";
import SessionFlash from "./core/sessionFlash.js";
import Markdown from "./core/markdown.js";
import MarkdownIndent from "./core/markdownIndent.js";
import Route from "./core/route.js";
import Redirect from "./core/redirect.js";
import Section from "./core/sections/section.js";
import Obfuscate from "./core/obfuscate.js";
import Parent from "./core/parent.js";
import { TransChoiceTag, Translate, TransTag } from "./core/translate.js";
import SVGTag from "./core/svg.js";
import Asset from "./core/asset.js";
import Assets from "./core/assets.js";
import GetContent from "./core/getContent.js";
import GetFiles from "./core/getFiles.js";
import Glide from "./core/glide.js";
import { ForeachTag, IterateTag } from "./core/iterate.js";
import Locales from "./core/locales.js";
import Mix from "./core/mix.js";
import UserIn from "./core/userIn.js";
import UserNotIn from "./core/userNotIn.js";
import UserIs from "./core/userIs.js";
import UserIsnt from "./core/userIsnt.js";
import CollectionPrevious from "./core/collection/previous.js";
import CollectionNext from "./core/collection/next.js";
import In from "./core/in.js";
import NotFound from "./core/notFound.js";
import Is from "./core/is.js";
import Widont from "./core/widont.js";
import UserProfile from "./core/userProfile.js";
import { DddTag, DdTag } from "./core/dd.js";
import PathTag from "./core/path.js";
import UserCant from "./core/userCant.js";
import QueryTag from "./core/queryTag.js";
import Theme from "./core/theme/theme.js";
import { ThemeAsset, ThemePath } from "./core/theme/themePath.js";
import ThemeCss from "./core/theme/themeCss.js";
import ThemeImg from "./core/theme/themeImg.js";
import ThemeJavaScript from "./core/theme/themeJs.js";
import ThemeOutput from "./core/theme/themeOutput.js";
import GlideBatch from "./core/glideBatch.js";
import ScopeTag from "./core/scopeTag.js";
import If from "./core/conditions/if.js";
import ElseIf from "./core/conditions/elseIf.js";
import Else from "./core/conditions/else.js";
import SessionTag from "./core/session.js";
import {
    CollectionNewer,
    CollectionOlder,
} from "./core/collection/ageDirectional.js";
import {
    MemberCan,
    MemberIn,
    MemberIs,
    MemberIsnt,
    MemberLogout,
    MemberLogoutUrl,
    MemberNotIn,
    MemberProfile,
    MemberTag,
} from "./core/memberUserAliases.js";
import TaxonomyTag from "./core/taxonomies/taxonomy.js";
import { NavTag, StructureTag } from "./core/nav/nav.js";
import NavBreadcrumbs from "./core/nav/breadcrumbs.js";
import FormTag from "./core/form/form.js";
import FormSetTag from "./core/form/formSet.js";
import FormCreate from "./core/form/formCreate.js";
import FormSubmission from "./core/form/formSubmission.js";
import FormSuccess from "./core/form/formSuccess.js";
import FormSubmissions from "./core/form/formSubmissions.js";
import FormErrors from "./core/form/formErrors.js";
import User from "./core/user.js";
import { BaseSearchTag, SearchResultsTag } from "./core/search.js";
import { MemberLoginForm, UserLoginForm } from "./core/userLoginForm.js";
import {
    MemberPasswordReset,
    UserPasswordReset,
} from "./core/userPasswordReset.js";
import { MemberRegister, UserRegister } from "./core/userRegister.js";
import NoParse from "./core/noParse.js";
import Unless from "./core/conditions/unless.js";
import ElseUnless from "./core/conditions/elseUnless.js";
import { InstalledTag } from "./core/installed.js";
import Relate from './core/relate.js';
import SessionHas from './core/sessionHas.js';
import IncrementReset from './core/incrementReset.js';
import LocalesCount from './core/localeCount.js';
import { MemberForgotPasswordForm, UserForgotPasswordForm } from './core/userForgotPasswordForm.js';
import PartialExists from './core/partials/partialExists.js';
import PartialIfExists from './core/partials/partialIfExists.js';
import GetErrors from './core/getErrors/getErrors.js';
import GetAllErrors from './core/getErrors/getAllErrors.js';
import GetError from './core/getErrors/getError.js';
import SetTag from './core/set.js';
import MountUrlTag from './core/mountUrl.js';
import Vite from './core/vite.js';
import NoCache from './core/nocache.js';
import UserRoles from './core/userRoles.js';
import UserGroups from './core/userGroups.js';
import GlideDataUrl from './core/glideDataUrl.js';
import CookieTag from './core/cookie/cookie.js';
import CookieForget from './core/cookie/cookieForget.js';
import CookieHas from './core/cookie/cookieHas.js';
import CookieSet from './core/cookie/cookieSet.js';
import CookieValue from './core/cookie/cookieValue.js';
import UserProfileForm from './core/userProfileForm.js';
import UserPasswordForm from './core/userPasswordForm.js';
import ViteAsset from './core/vite/viteAsset.js';

const coreTags = [
    If,
    ElseIf,
    Else,
    Unless,
    ElseUnless,

    Asset,
    Assets,
    Collection,
    CollectionCount,
    CollectionPrevious,
    CollectionNext,
    CollectionNewer,
    CollectionOlder,

    CookieTag,
    CookieForget,
    CookieHas,
    CookieSet,
    CookieValue,

    Relate,

    FormTag,

    FormCreate,

    FormSubmission,
    FormSubmissions,
    FormSetTag,
    FormSuccess,
    FormErrors,

    SetTag,

    GetErrors,
    GetError,
    GetAllErrors,

    BaseSearchTag,
    SearchResultsTag,

    Partial,
    PartialExists,
    PartialIfExists,

    Error404,
    NotFound,
    Dump,
    DddTag,
    DdTag,

    Cache,
    GetContent,
    GetFiles,
    Glide,
    GlideBatch,
    GlideDataUrl,
    Link,
    Loop,
    RangeTag,
    IterateTag,
    ForeachTag,
    Increment,
    IncrementReset,
    Locales,
    LocalesCount,

    Mix,
    MountUrlTag,
    NavTag,
    StructureTag,
    NavBreadcrumbs,
    Yield,
    Yields,
    UserIn,
    In,
    UserNotIn,
    UserIs,
    Is,

    InstalledTag,
    UserRoles,
    UserGroups,
    
    User,
    UserIsnt,
    UserCan,
    UserCant,
    UserLogout,
    UserLogoutUrl,
    UserProfile,
    UserLoginForm,
    UserPasswordReset,
    UserForgotPasswordForm,
    UserProfileForm,
    UserPasswordForm,
    UserRegister,

    MemberTag,
    MemberIs,
    MemberIsnt,
    MemberProfile,
    MemberCan,
    MemberLogout,
    MemberLogoutUrl,
    MemberIn,
    MemberNotIn,
    MemberLoginForm,
    MemberPasswordReset,
    MemberForgotPasswordForm,
    MemberRegister,

    NoParse,
    NoCache,

    Switch,
    Rotate,
    OAuth,
    Obfuscate,
    Parent,
    PathTag,
    Redirect,
    Route,
    ScopeTag,
    Section,
    SessionTag,
    SessionFlash,
    SessionFlush,
    SessionForget,
    SessionSet,
    SessionHas,
    SessionDump,
    SVGTag,
    TaxonomyTag,
    Theme,
    ThemePath,
    ThemeAsset,
    ThemeCss,
    ThemeImg,
    ThemeJavaScript,
    ThemeOutput,

    Translate,
    TransTag,
    TransChoiceTag,
    QueryTag,
    Markdown,
    MarkdownIndent,
    Widont,
    Vite,
    ViteAsset
];

export { coreTags };
