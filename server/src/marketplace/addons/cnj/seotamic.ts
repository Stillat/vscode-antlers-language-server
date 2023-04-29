import { IMarketplaceAddon } from '../../marketplaceTypes';

const Seotamic: IMarketplaceAddon = {
    packageName: 'cnj/seotamic',
    providesTags: [
        'seotamic',
        'seotamic:meta:title',
        'seotamic:meta:description',
        'seotamic:meta:canonical',
        'seotamic:meta:robots',
        'seotamic:og',
        'seotamic:twitter',
        'seotamic:social:title',
        'seotamic:social:description',
        'seotamic:social:image',
        'seotamic:social:site_name',
    ],
    providesModifiers: []
}

export default Seotamic;
