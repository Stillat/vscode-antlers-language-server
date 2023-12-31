import SocialLinks from './addons/aerni/social-links.js';
import StatamicAdvancedSeo from './addons/aerni/statamic-advanced-seo.js';
import StatamicLivewireForms from './addons/aerni/statamic-livewire-forms.js';
import StatamicRecaptcha from './addons/anakadote/statamic-recaptcha.js';
import StatamicCaptcha from './addons/aryehraber/statamicCaptcha.js';
import Seotamic from './addons/cnj/seotamic.js';
import CookieByte from './addons/ddm-studio/cookie-byte.js';
import SimpleCommerce from './addons/doublethreedigital/simple-commerce.js';
import StatamicLivewire from './addons/jonassiewertsen/statamicLivewire.js';
import StatamicSnippet from './addons/kolaente/statamic-snippet.js';
import StatamicInlineAssets from './addons/octoper/statamic-inline-assets.js';
import StatamicFastSeo from './addons/parfaitementweb/statamic-fast-seo.js';
import SeoPro from './addons/statamic/seoPro.js';
import AntlersLayouts from './addons/stillat/antlersLayouts.js';
import StatamicClassify from './addons/visuellverstehen/statamicClassify.js';
import AardvarkSeo from './addons/withcandour/aardvarkSeo.js';
import { IMarketplaceAddon } from './marketplaceTypes.js';

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
