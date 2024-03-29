import { IMarketplaceAddon } from '../../marketplaceTypes.js';

const StatamicRecaptcha: IMarketplaceAddon = {
    packageName: 'anakadote/statamic-recaptcha',
    providesTags: [
        'recaptcha',
        'recaptcha:terms',
        'recaptcha:checkbox',
    ],
    providesModifiers: []
}

export default StatamicRecaptcha;
