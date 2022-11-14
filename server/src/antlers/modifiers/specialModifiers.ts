import { IModifier } from '../modifierTypes';

const specialModifiers: IModifier[] = [
    {
        name: 'partial',
        acceptsType: ['*'],
        returnsType: ['*view*'],
        forFieldType: [],
        description: 'Injects data into a partial and renders it.',
        docLink: 'https://statamic.dev/modifiers/partial',
        parameters: [
            {
                name: 'partial',
                description: 'The name of the partial.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'macro',
        acceptsType: ['*'],
        returnsType: ['*'],
        forFieldType: [],
        description: 'Runs a pre-configured macro on the data.',
        docLink: 'https://statamic.dev/modifiers/macro',
        parameters: [
            {
                name: 'macro',
                description: 'The macro name.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'url',
        acceptsType: ['string', '*'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Locates the URL of an asset, page, entry, or taxonomy term based on the variable contents.',
        docLink: 'https://statamic.dev/modifiers/url',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    /*{name: 'get'},
    {name:'raw'},*/
];

export { specialModifiers };
