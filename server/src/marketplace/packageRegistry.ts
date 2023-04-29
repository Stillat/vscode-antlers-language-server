import SocialLinks from './addons/aerni/social-links';
import StatamicAdvancedSeo from './addons/aerni/statamic-advanced-seo';
import StatamicLivewireForms from './addons/aerni/statamic-livewire-forms';
import StatamicRecaptcha from './addons/anakadote/statamic-recaptcha';
import StatamicCaptcha from './addons/aryehraber/statamicCaptcha';
import Seotamic from './addons/cnj/seotamic';
import CookieByte from './addons/ddm-studio/cookie-byte';
import SimpleCommerce from './addons/doublethreedigital/simple-commerce';
import StatamicLivewire from './addons/jonassiewertsen/statamicLivewire';
import StatamicSnippet from './addons/kolaente/statamic-snippet';
import StatamicInlineAssets from './addons/octoper/statamic-inline-assets';
import StatamicFastSeo from './addons/parfaitementweb/statamic-fast-seo';
import SeoPro from './addons/statamic/seoPro';
import AntlersLayouts from './addons/stillat/antlersLayouts';
import StatamicClassify from './addons/visuellverstehen/statamicClassify';
import AardvarkSeo from './addons/withcandour/aardvarkSeo';
import { IMarketplaceAddon } from './marketplaceTypes';

const KnownPackages: IMarketplaceAddon[] = [
    SeoPro,
    AntlersLayouts,
    StatamicCaptcha,
    StatamicLivewire,
    StatamicClassify,
    AardvarkSeo,
    CookieByte,
    StatamicSnippet,
    StatamicInlineAssets,
    Seotamic,
    SocialLinks,
    SimpleCommerce,
    StatamicFastSeo,
    StatamicRecaptcha,
    StatamicAdvancedSeo,
    StatamicLivewireForms,
];

export { KnownPackages };
