import { IAntlersParameter } from '../../../tagManager';

const NavParameters: IAntlersParameter[] = [
    {
        isRequired: false,
        acceptsVariableInterpolation: false,
        aliases: ['handle'],
        allowsVariableReference: false,
        name: 'for',
        description: 'The navigation or collection to use',
        expectsTypes: ['string'],
        isDynamic: false,
    },
    {
        isRequired: false,
        acceptsVariableInterpolation: false,
        aliases: [],
        name: 'from',
        description: 'The starting point for the navigation',
        allowsVariableReference: true,
        expectsTypes: ['string'],
        isDynamic: false,
    },
    {
        isRequired: false,
        acceptsVariableInterpolation: false,
        aliases: [],
        allowsVariableReference: false,
        name: 'show_unpublished',
        description: 'Whether to include unpublished content',
        expectsTypes: ['boolean'],
        isDynamic: false
    },
    {
        isRequired: false,
        acceptsVariableInterpolation: false,
        aliases: [],
        allowsVariableReference: false,
        name: 'include_home',
        description: 'Whether to include the home page in the tree',
        expectsTypes: ['boolean'],
        isDynamic: false
    },
    {
        isRequired: false,
        acceptsVariableInterpolation: false,
        aliases: [],
        allowsVariableReference: false,
        name: 'max_depth',
        description: 'The maximum depth of the navigation or structure',
        expectsTypes: ['number'],
        isDynamic: false
    }
];

export default NavParameters;
