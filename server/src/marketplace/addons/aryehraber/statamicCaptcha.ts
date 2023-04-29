import { IMarketplaceAddon } from '../../marketplaceTypes';

const StatamicCaptcha: IMarketplaceAddon = {
    packageName: 'aryehraber/statamic-captcha',
    providesTags: [
        'captcha',
        'captcha:head',
        'captcha:disclaimer',
        'captcha:sitekey',
    ],
    providesModifiers: []
}

export default StatamicCaptcha;
