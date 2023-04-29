import { IMarketplaceAddon } from '../../marketplaceTypes';

const StatamicInlineAssets: IMarketplaceAddon = {
    packageName: 'octoper/statamic-inline-assets',
    providesTags: [
        'inline_assets',
        'inline_assets:css',
        'inline_assets:js',
    ],
    providesModifiers: []
}

export default StatamicInlineAssets;
