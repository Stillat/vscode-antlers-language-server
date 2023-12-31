import { IMarketplaceAddon } from '../../marketplaceTypes.js';

const StatamicFastSeo: IMarketplaceAddon = {
    packageName: 'parfaitementweb/statamic-fast-seo',
    providesTags: [
        'fast-seo',
        'fast-seo:title',
        'fast-seo:description',
        'fast-seo:name',
        'fast-seo:og_image',
        'fast-seo:twitter_handle',
        'fast-seo:twitter_image',
        'fast-seo:robots',
        'fast-seo:locale',
        'fast-seo:locales',
        'fast-seo:canonical',
        'fast-seo:extra',
    ],
    providesModifiers: []
}

export default StatamicFastSeo;
