import { IMarketplaceAddon } from '../../marketplaceTypes.js';

const StatamicAdvancedSeo: IMarketplaceAddon = {
    packageName: 'aerni/advanced-seo',
    providesTags: [
        'seo',
        'seo:description',
        'seo:site_name',
        'seo:canonical_entry:title',
        'seo:head',
        'seo:body',
        'seo:dump',

    ],
    providesModifiers: []
}

export default StatamicAdvancedSeo;
