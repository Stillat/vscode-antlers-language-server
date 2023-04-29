import { IMarketplaceAddon } from '../../marketplaceTypes';

const SimpleCommerce: IMarketplaceAddon = {
    packageName: 'doublethreedigital/simple-commerce',
    providesTags: [
        'sc',
        'sc:cart',
        'sc:cart:items',
        'sc:cart:has',
        'sc:cart:total',
        'sc:cart:grand_total',
        'sc:cart:items_total',
        'sc:cart:shipping_total',
        'sc:cart:tax_total',
        'sc:cart:tax_total_split',
        'sc:cart:coupon_total',
        'sc:cart:itemsTotalWithTax',
        'sc:cart:raw_grand_total',
        'sc:cart:free',
        'sc:cart:addItem',
        'sc:cart:updateItem',
        'sc:cart:removeItem',
        'sc:cart:update',
        'sc:cart:empty',
        'sc:cart:alreadyExists',
    ],
    providesModifiers: []
}

export default SimpleCommerce;
