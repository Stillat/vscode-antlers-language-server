import Collection from "./core/collection/collection";
import Cache from "./core/cache";
import Dump from "./core/dump";
import Error404 from "./core/error404";
import Link from "./core/link";
import { Loop, RangeTag } from "./core/loop";
import Partial from "./core/partials/partial";
import CollectionCount from "./core/collection/count";
import Increment from "./core/increment";
import { Yield, Yields } from "./core/sections/yield";
import UserCan from "./core/userCan";
import UserLogout from "./core/userLogout";
import UserLogoutUrl from "./core/userLogoutUrl";
import { Switch, Rotate } from "./core/switch";
import OAuth from "./core/oauth";
import SessionDump from "./core/sessionDump";
import SessionSet from "./core/sessionSet";
import SessionForget from "./core/sessionForget";
import SessionFlush from "./core/sessionFlush";
import SessionFlash from "./core/sessionFlash";
import Markdown from "./core/markdown";
import MarkdownIndent from "./core/markdownIndent";
import Route from "./core/route";
import Redirect from "./core/redirect";
import Section from "./core/sections/section";
import Obfuscate from "./core/obfuscate";
import Parent from "./core/parent";
import { TransChoiceTag, Translate, TransTag } from "./core/translate";
import SVGTag from "./core/svg";
import Asset from "./core/asset";
import Assets from "./core/assets";
import GetContent from "./core/getContent";
import GetFiles from "./core/getFiles";
import Glide from "./core/glide";
import { ForeachTag, IterateTag } from "./core/iterate";
import Locales from "./core/locales";
import Mix from "./core/mix";
import UserIn from "./core/userIn";
import UserNotIn from "./core/userNotIn";
import UserIs from "./core/userIs";
import UserIsnt from "./core/userIsnt";
import CollectionPrevious from "./core/collection/previous";
import CollectionNext from "./core/collection/next";
import In from "./core/in";
import NotFound from "./core/notFound";
import Is from "./core/is";
import Widont from "./core/widont";
import UserProfile from "./core/userProfile";
import { DddTag, DdTag } from "./core/dd";
import PathTag from "./core/path";
import UserCant from "./core/userCant";
import QueryTag from "./core/queryTag";
import Theme from "./core/theme/theme";
import { ThemeAsset, ThemePath } from "./core/theme/themePath";
import ThemeCss from "./core/theme/themeCss";
import ThemeImg from "./core/theme/themeImg";
import ThemeJavaScript from "./core/theme/themeJs";
import ThemeOutput from "./core/theme/themeOutput";
import GlideBatch from "./core/glideBatch";
import ScopeTag from "./core/scopeTag";
import If from "./core/conditions/if";
import ElseIf from "./core/conditions/elseIf";
import Else from "./core/conditions/else";
import SessionTag from "./core/session";
import {
    CollectionNewer,
    CollectionOlder,
} from "./core/collection/ageDirectional";
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
} from "./core/memberUserAliases";
import TaxonomyTag from "./core/taxonomies/taxonomy";
import { NavTag, StructureTag } from "./core/nav/nav";
import NavBreadcrumbs from "./core/nav/breadcrumbs";
import FormTag from "./core/form/form";
import FormSetTag from "./core/form/formSet";
import FormCreate from "./core/form/formCreate";
import FormSubmission from "./core/form/formSubmission";
import FormSuccess from "./core/form/formSuccess";
import FormSubmissions from "./core/form/formSubmissions";
import FormErrors from "./core/form/formErrors";
import User from "./core/user";
import { BaseSearchTag, SearchResultsTag } from "./core/search";
import { MemberLoginForm, UserLoginForm } from "./core/userLoginForm";
import {
    MemberPasswordReset,
    UserPasswordReset,
} from "./core/userPasswordReset";
import { MemberRegister, UserRegister } from "./core/userRegister";
import NoParse from "./core/noParse";
import Unless from "./core/conditions/unless";
import ElseUnless from "./core/conditions/elseUnless";
import { InstalledTag } from "./core/installed";
import Relate from './core/relate';
import SessionHas from './core/sessionHas';
import IncrementReset from './core/incrementReset';
import LocalesCount from './core/localeCount';
import { MemberForgotPasswordForm, UserForgotPasswordForm } from './core/userForgotPasswordForm';
import PartialExists from './core/partials/partialExists';
import PartialIfExists from './core/partials/partialIfExists';
import GetErrors from './core/getErrors/getErrors';
import GetAllErrors from './core/getErrors/getAllErrors';
import GetError from './core/getErrors/getError';
import SetTag from './core/set';
import MountUrlTag from './core/mountUrl';
import Vite from './core/vite';
import NoCache from './core/nocache';
import UserRoles from './core/userRoles';
import UserGroups from './core/userGroups';

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
    Vite
];

export { coreTags };
