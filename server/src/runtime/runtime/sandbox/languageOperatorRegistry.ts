export class LanguageOperatorRegistry {
    static readonly STR_STARTS_WITH = 'startswith';
    static readonly STR_ENDS_WITH = 'endswith';
    static readonly STR_IS = 'str_is';
    static readonly STR_ASCII = 'str_ascii';
    static readonly STR_IS_URL = 'is_url';
    static readonly STR_FINISH = 'str_finish';
    static readonly STR_CONTAINS = 'str_contains';
    static readonly STR_AFTER = 'str_after';
    static readonly STR_LOWER = 'str_lower';
    static readonly STR_UPPER = 'str_upper';
    static readonly STR_UCFIRST = 'str_ucfirst';
    static readonly STR_LENGTH = 'str_len';
    static readonly STR_AFTER_LAST = 'str_after_last';
    static readonly STR_BEFORE = 'str_before';
    static readonly STR_BEFORE_LAST = 'str_before_last';
    static readonly STR_CONTAINS_ALL = 'str_contains_all';
    static readonly STR_CAMEL = 'str_camel';
    static readonly STR_SNAKE = 'str_snake';
    static readonly STR_WORD_COUNT = 'str_word_count';
    static readonly STR_STUDLY = 'str_studly';
    static readonly STR_KEBAB = 'str_kebab';
    static readonly STR_TITLE = 'str_title';
    static readonly ARR_HAS = 'arr_has';
    static readonly ARR_CONTAINS = 'arr_contains';
    static readonly ARR_CONTAINS_ANY = 'contains_any';
    static readonly ARR_SORT = 'arr_sort';
    static readonly ARR_WRAP = 'arr_wrap';
    static readonly ARR_RECURSIVE_SORT = 'arr_sort_recursive';
    static readonly ARR_HAS_ANY = 'has_any';
    static readonly ARR_PLUCK = 'pluck';
    static readonly ARR_GET = 'get';
    static readonly ARR_TAKE = 'take';
    static readonly ARR_MAKE = 'arr';
    static readonly ARR_ORDERBY = 'orderby';
    static readonly ARR_GROUPBY = 'groupby';
    static readonly ARR_MERGE = 'merge';
    static readonly ARR_CONCAT = 'concat';
    static readonly ARR_PLUCK_INTO = 'pluck_into';
    static readonly QUERY_WHERE = 'where';
    static readonly DATA_GET = 'data_get';

    static readonly STRUCT_SWITCH = 'switch';
    static readonly BITWISE_AND = 'bwa';
    static readonly BITWISE_OR = 'bwo';
    static readonly BITWISE_XOR = 'bxor';
    static readonly BITWISE_NOT = 'bnot';
    static readonly BITWISE_SHIFT_LEFT = 'bsl';
    static readonly BITWISE_SHIFT_RIGHT = 'bsr';

    static readonly operators = [
        'startswith',
        'endswith',
        'str_is',
        'str_ascii',
        'is_url',
        'str_finish',
        'str_contains',
        'str_after',
        'str_lower',
        'str_upper',
        'str_ucfirst',
        'str_len',
        'str_after_last',
        'str_before',
        'str_before_last',
        'str_contains_all',
        'str_camel',
        'str_snake',
        'str_word_count',
        'str_studly',
        'str_kebab',
        'str_title',
        'arr_has',
        'arr_contains',
        'contains_any',
        'arr_sort',
        'arr_wrap',
        'arr_sort_recursive',
        'has_any',
        'pluck',
        'get',
        'take',
        'arr',
        'orderby',
        'groupby',
        'merge',
        'concat',
        'pluck_into',
        'where',
        'data_get',
        'switch',
        'bwa',
        'bwo',
        'bxor',
        'bsl',
        'bsr',
    ];
}