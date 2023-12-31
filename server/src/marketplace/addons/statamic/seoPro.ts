import { IMarketplaceAddon } from '../../marketplaceTypes.js';

const SeoPro: IMarketplaceAddon = {
    packageName: 'statamic/seo-pro',
    providesTags: [
        'seo_pro',
        'seo_pro:meta',
        'seo_pro:meta_data',
        'seo_pro:dump_meta_data',
    ],
    providesModifiers: []
}

export default SeoPro;
