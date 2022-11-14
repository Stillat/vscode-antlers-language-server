import { IModifier } from '../modifierTypes';

const assetModifiers: IModifier[] = [
    {
        name: 'background_position',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: ['assets'],
        description: 'Converts an asset focal point into a background-position CSS property.',
        docLink: 'https://statamic.dev/modifiers/background_position',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'image',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: ['assets'],
        description: 'Generates an HTML image element with the variable\'s value as the src.',
        docLink: 'https://statamic.dev/modifiers/image',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'output',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: ['assets'],
        description: 'Returns the string output of an Asset file\'s contents.',
        docLink: 'https://statamic.dev/modifiers/output',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
];

export { assetModifiers };
