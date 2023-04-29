import { IMarketplaceAddon } from '../../marketplaceTypes';

const StatamicClassify: IMarketplaceAddon = {
    packageName: 'visuellverstehen/statamic-classify',
    providesTags: [
        'classify'
    ],
    providesModifiers: [
        'classify',
    ]
}

export default StatamicClassify;
