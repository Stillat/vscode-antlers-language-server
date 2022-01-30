export class LanguageOperatorRegistry {
    static readonly ARR_PLUCK = 'pluck';
    static readonly ARR_TAKE = 'take';
    static readonly ARR_SKIP = 'skip';
    static readonly ARR_MAKE = 'arr';
    static readonly ARR_ORDERBY = 'orderby';
    static readonly ARR_GROUPBY = 'groupby';
    static readonly ARR_MERGE = 'merge';
    static readonly QUERY_WHERE = 'where';

    static readonly STRUCT_SWITCH = 'switch';
    static readonly BITWISE_AND = 'bwa';
    static readonly BITWISE_OR = 'bwo';
    static readonly BITWISE_XOR = 'bxor';
    static readonly BITWISE_NOT = 'bnot';
    static readonly BITWISE_SHIFT_LEFT = 'bsl';
    static readonly BITWISE_SHIFT_RIGHT = 'bsr';

    static readonly operators = [
        'pluck',
        'take',
        'arr',
        'skip',
        'orderby',
        'groupby',
        'merge',
        'where',
        'switch',
        'bwa',
        'bwo',
        'bxor',
        'bsl',
        'bsr',
    ];
}