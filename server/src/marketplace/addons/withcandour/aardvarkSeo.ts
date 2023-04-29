import { IMarketplaceAddon } from '../../marketplaceTypes';

const AardvarkSeo: IMarketplaceAddon = {
    packageName: 'withcandour/aardvark-seo',
    providesTags: [
        'aardvark-seo',
        'aardvark-seo:head',
        'aardvark-seo:body',
        'aardvark-seo:footer',
    ],
    providesModifiers: []
}

export default AardvarkSeo;
