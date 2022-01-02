export class AntlersErrorCodes {
    static readonly TYPE_EXPECTING_OPERAND = 'ANTLR_001';
    static readonly TYPE_UNEXPECTED_END_OF_INPUT = 'ANTLR_002';
    static readonly TYPE_RUNTIME_TYPE_MISMATCH = 'ANTLR_003';
    static readonly TYPE_RUNTIME_DIVIDE_BY_ZERO = 'ANTLR_004';
    static readonly TYPE_RUNTIME_UNKNOWN_LANG_OPERATOR = 'ANTLR_005';
    static readonly TYPE_RUNTIME_UNEXPECTED_STACK_CONDITION = 'ANTLR_006';
    static readonly TYPE_RUNTIME_PARSE_VALUE_VIOLATION = 'ANTLR_007';
    static readonly TYPE_PARSE_UNCLOSED_CONDITIONAL = 'ANTLR_008';
    static readonly TYPE_PARSE_EMPTY_CONDITIONAL = 'ANTLR_009';
    static readonly TYPE_PARSE_UNPAIRED_CONDITIONAL = 'ANTLR_008';
    static readonly TYPE_ILLEGAL_STRING_ESCAPE_SEQUENCE = 'ANTLR_009';
    static readonly TYPE_INCOMPLETE_ANTLERS_REGION = 'ANTLR_010';
    static readonly TYPE_INCOMPLETE_ANTELRS_COMMENT_REGION = 'ANTLR_011';
    static readonly TYPE_ILLEGAL_VARPATH_RIGHT = 'ANTLR_012';
    static readonly TYPE_ILLEGAL_DOTVARPATH_RIGHT = 'ANTLR_013';
    static readonly TYPE_ILLEGAL_VARPATH_SUBPATH_START = 'ANTLR_014';
    static readonly TYPE_ILLEGAL_VARPATH_SPACE_RIGHT = 'ANTLR_015';
    static readonly TYPE_UNEXPECTED_EOI_VARPATH_ACCESSOR = 'ANTLR_016';
    static readonly TYPE_ILLEGAL_VARIABLE_NAME = 'ANTLR_017';
    static readonly TYPE_UNSET_MODIFIER_DETAILS = 'ANTLR_018';
    static readonly TYPE_MODIFIER_NAME_NOT_START_OF_DETAILS = 'ANTLR_019';
    static readonly TYPE_MODIFIER_UNEXPECTED_VALUE = 'ANTLR_020';
    static readonly TYPE_MODIFIER_UNEXPECTED_END_OF_VALUE_LIST = 'ANTLR_021';
    static readonly TYPE_TERNARY_EXPECTING_BRANCH_SEPARATOR = 'ANTLR_022';
    static readonly TYPE_TERNARY_UNEXPECTED_EXPRESSION_LENGTH = 'ANTLR_023';
    static readonly TYPE_RECURSIVE_UNPAIRED_NODE = 'ANTLR_024';
    static readonly TYPE_RECURSIVE_NODE_INVALID_POSITION = 'ANTLR_025';
    static readonly TYPE_NO_PARSE_UNASSOCIATED = 'ANTLR_026';
    static readonly TYPE_RECURSIVE_NODE_UNASSOCIATED_PARENT = 'ANTLR_027';
    static readonly TYPE_LOGIC_GROUP_NO_END = 'ANTLR_028';
    static readonly TYPE_LOGIC_GROUP_NO_START = 'ANTLR_029';
    static readonly TYPE_UNEXPECTED_BRANCH_SEPARATOR = 'ANTLR_030';
    static readonly TYPE_UNEXPECTED_BRANCH_SEPARATOR_FOR_VARCOMBINE = 'ANTLR_031';
    static readonly TYPE_UNEXPECTED_MODIFIER_SEPARATOR = 'ANTLR_032';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_PARSING_MODIFIER_DETAILS = 'ANTLR_033';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_PARSING_MODIFIER_VALUE = 'ANTLR_034';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_PARSING_NODE_PARAMETER = 'ANTLR_035';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_MANIFESTING_ANTLERS_NODE = 'ANTLR_036';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_REDUCING_NEGATION_OPERATORS = 'ANTLR_037';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_PARSING_SEMANTIC_GROUP = 'ANTLR_038';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_PARSING_NULL_COALESCENCE_GROUP = 'ANTLR_039';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_PARSING_TERNARY_GROUP = 'ANTLR_040';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_PARSING_TERNARY_GROUP_FALSE_BRANCH = 'ANTLR_041';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_EXITING_TERNARY_GROUP = 'ANTLR_042';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_PARSING_LOGIC_GROUP_NEGATION_OFFSET = 'ANTLR_043';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_PARSING_LOGIC_GROUP_END_DUE_TO_NEGATION = 'ANTLR_044';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_PARSING_LOGIC_GROUP_END = 'ANTLR_045';
    static readonly TYPE_RUNTIME_UNKNOWN_LIBRARY = 'ANTLR_046';
    static readonly TYPE_RUNTIME_LIBRARY_BAD_METHOD_CALL = 'ANTLR_047';
    static readonly TYPE_UNEXPECTED_FACTORIAL_WHILE_CREATING_GROUPS = 'ANTLR_048';
    static readonly TYPE_UNEXPECTED_FACTORIAL_OPERAND = 'ANTLR_049';
    static readonly TYPE_UNEXPECTED_LOGIC_NEGATION_OPERATOR = 'ANTLR_050';
    static readonly TYPE_FACTORIAL_MATERIALIZED_BOOL_DETECTED = 'ANTLR_051';
    static readonly TYPE_ARG_UNEXPECTED_NAMED_ARGUMENT = 'ANTLR_052';
    static readonly TYPE_UNEXPECTED_EOI_PARSING_BRANCH_GROUP = 'ANTLR_053';
    static readonly TYPE_UNEXPECTED_UNNAMED_METHOD_ARGUMENT = 'ANTLR_054';
    static readonly TYPE_LIBRARY_CALL_NO_ARGS_PROVIDED = 'ANTLR_055';
    static readonly TYPE_LIBRARY_CALL_MISSING_REQUIRED_FORMAL_ARG = 'ANTLR_056';
    static readonly TYPE_LIBRARY_CALL_RUNTIME_TYPE_MISMATCH = 'ANTLR_057';
    static readonly TYPE_LIBRARY_CALL_UNEXPECTED_ARG_RESOLVE_FAULT = 'ANTLR_058';
    static readonly TYPE_LIBRARY_CALL_TOO_MANY_ARGUMENTS = 'ANTLR_059';
    static readonly TYPE_UNEXPECTED_TOKEN_WHILE_PARSING_METHOD = 'ANTLR_060';
    static readonly TYPE_INVALID_NAMED_ARG_IDENTIFIER = 'ANTLR_061';
    static readonly TYPE_LIBRARY_CALL_INVALID_ARGUMENT_NAME = 'ANTLR_062';
    static readonly TYPE_RUNTIME_ATTEMPT_TO_OVERWRITE_LOADED_LIBRARY = 'ANTLR_063';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_PARSING_ARG_GROUP = 'ANTLR_064';
    static readonly TYPE_EXPECTING_ARGUMENT_GROUP = 'ANTLR_065';
    static readonly TYPE_RUNTIME_PROTECTED_LIBRARY_ACCESS_VIOLATION = 'ANTLR_066';
    static readonly TYPE_RUNTIME_FATAL_UNPAIRED_LOOP_END = 'ANTLR_067';
    static readonly TYPE_UNEXPECTED_OPERATOR = 'ANTLR_068';
    static readonly TYPE_OPERATOR_INVALID_ON_RIGHT = 'ANTLR_069';
    static readonly TYPE_INVALID_ASSIGNMENT_LOOP_PAIR = 'ANTLR_070';
    static readonly TYPE_UNEXPECTED_EOI_PARSING_ORDER_GROUP = 'ANTLR_071';
    static readonly TYPE_EXPECTING_ORDER_GROUP_FOR_ORDER_BY_OPERAND = 'ANTLR_072';
    static readonly TYPE_QUERY_UNSUPPORTED_VALUE_TYPE = 'ANTLR_073';
    static readonly TYPE_UNEXPECTED_RUNTIME_RESULT_FOR_ORDER_BY_CLAUSE = 'ANTLR_074';
    static readonly TYPE_UNEXPECTED_EMPTY_DIRECTION_GROUP = 'ANTLR_075';
    static readonly TYPE_INVALID_ORDER_BY_NAME_VALUE = 'ANTLR_076';
    static readonly TYPE_INVALID_ORDER_BY_SORT_VALUE = 'ANTLR_077';
    static readonly TYPE_UNEXPECTED_TOKEN_FOR_GROUP_BY = 'ANTLR_78';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_PARSING_GROUP_BY = 'ANTLR_079';
    static readonly TYPE_UNEXPECTED_GROUP_BY_AS_ALIAS_TYPE = 'ANTLR_080';
    static readonly TYPE_UNEXPECTED_EOI_WHILE_PARSING_SWITCH_GROUP = 'ANTLR_081';
    static readonly TYPE_UNEXPECTED_TOKEN_FOR_SWITCH_GROUP = 'ANTLR_082';
    static readonly TYPE_UNEXPECTED_SWITCH_START_VALUE = 'ANTLR_083';
    static readonly TYPE_UNEXPECTED_SWITCH_START_VALUE_NO_VALUE = 'ANTLR_084';
    static readonly TYPE_UNEXPECTED_SWITCH_START_VALUE_NO_SEMANTIC_VALUE = 'ANTLR_085';
    static readonly TYPE_SWITCH_DEFAULT_MUST_BE_LAST = 'ANTLR_086';
    static readonly TYPE_PARSER_INVALID_SWITCH_TOKEN = 'ANTLR_087';
    static readonly TYPE_ORDER_BY_INVALID_RETURN_TYPE = 'ANTLR_088';
    static readonly TYPE_GROUP_BY_SCOPED_GROUP_MUST_BE_ENCLOSED = 'ANTLR_089';
    static readonly TYPE_PLUCK_INTO_MISSING_VARIABLE_TARGET = 'ANTLR_090';
    static readonly TYPE_PLUCK_INTO_INVALID_VARIABLE_TARGET = 'ANTLR_091';
    static readonly TYPE_PLUCK_INTO_NO_PREDICATE = 'ANTLR_092';
    static readonly TYPE_PLUCK_INTO_INVALID_PREDICATE_VALUE = 'ANTLR_093';
    static readonly TYPE_PLUCK_INTO_EMPTY_LOGIC_GROUP = 'ANTLR_094';
    static readonly TYPE_PLUCK_INTO_INVALID_NUMBER_OF_TUPLE_VARIABLES = 'ANTLR_095';
    static readonly TYPE_PLUCK_INTO_UNKNOWN_ALIAS_VARNAME = 'ANTLR_096';
    static readonly TYPE_PLUCK_INTO_UNEXPECTED_EMPTY_T_LOGIC_GROUP = 'ANTLR_097';
    static readonly TYPE_PLUCK_INTO_REFERENCE_TYPE_DYNAMIC = 'ANTLR_098';
    static readonly TYPE_PLUCK_INTO_REFERENCE_AMBIGUOUS = 'ANTLR_099';
    static readonly TYPE_RUNTIME_ASSIGNMENT_TO_NON_VAR = 'ANTLR_100';
    static readonly TYPE_ARR_MAKE_MISSING_TARGET = 'ANTLR_101';
    static readonly TYPE_ARR_MAKE_UNEXPECTED_TYPE = 'ANTLR_102';
    static readonly TYPE_ARR_MAKE_MISSING_ARR_KEY_PAIR_VALUE = 'ANTLR_103';
    static readonly TYPE_ARR_KEY_PAIR_INVALID_KEY_TYPE = 'ANTLR_104';
    static readonly TYPE_ARR_UNEXPECT_ARG_SEPARATOR = 'ANTLR_105';
    static readonly TYPE_ARR_KEY_PAIR_MISSING_KEY = 'ANTLR_106';
    static readonly RUNTIME_PROTECTED_VAR_ACCESS = 'ANTLR_107';
    static readonly RUNTIME_PROTECTED_TAG_ACCESS = 'ANTLR_108';
    static readonly RUNTIME_PROTECTED_MODIFIER_ACCESS = 'ANTLR_109';
    static readonly TYPE_INCOMPLETE_PHP_EVALUATION_REGION = 'ANTLR_110';
    static readonly RUNTIME_PHP_NODE_WHEN_PHP_DISABLED = 'ANTLR_111';
    static readonly RUNTIME_PHP_NODE_USER_CONTENT_TAG = 'ANTLR_112';
    static readonly TYPE_UNEXPECTED_TYPE_FOR_TUPLE_LIST = 'ANTLR_113';
    static readonly TYPE_UNEXPECTED_EOI_PARSING_TUPLE_LIST = 'ANTLR_114';

    static readonly TYPE_MISSING_BODY_TUPLE_LIST = 'ANTLR_115';
    static readonly TYPE_MISSING_NAMES_TUPLE_LIST = 'ANTLR_116';
    static readonly TYPE_VALUE_NAME_LENGTH_MISMATCH_TUPLE_LIST = 'ANTLR_117';
    static readonly TYPE_INVALID_TUPLE_LIST_NAME_TYPE = 'ANTLR_118';
    static readonly TYPE_INVALID_MANIFESTED_NAME_GROUP = 'ANTLR_119';
    static readonly TYPE_INVALID_TUPLE_LIST_VALUE_TYPE_GROUP = 'ANTLR_120';
    static readonly TYPE_INVALID_TUPLE_LIST_VALUE_TYPE = 'ANTLR_121';
    static readonly TYPE_RUNTIME_BAD_METHOD_CALL = 'ANTLR_122';

    static readonly TYPE_METHOD_CALL_MISSING_ARG_GROUP = 'ANTLR_123';
    static readonly TYPE_INVALID_METHOD_CALL_ARG_GROUP = 'ANTLR_124';
    static readonly TYPE_METHOD_CALL_MISSING_METHOD = 'ANTLR_125';
    static readonly TYPE_MODIFIER_NOT_FOUND = 'ANTLR_126';
    static readonly TYPE_RUNTIME_GENERAL_FAULT = 'ANTLR_127';
    static readonly TYPE_MODIFIER_INCORRECT_VALUE_POSITION = 'ANTLR_128';

    static readonly PARSER_CANNOT_PARSE_PATH_RECURSIVE = 'ANTLR_200';
    static readonly PATH_STRING_NOT_INSIDE_ARRAY_ACCESSOR = 'ANTLR_201';

    static readonly LINT_UNKNOWN_PARAMETER = 'ANTLR_500';
    static readonly LINT_GENERAL_INVALID_PARAMETER_CONTENTS = 'ANTLR_501';
    static readonly LINT_PARAMETER_CONTENT_INVALID_INTEGER = 'ANTLR_502';
    static readonly LINT_PARAMETER_CONTENT_INVALID_BOOLEAN = 'ANTLR_503';
    static readonly LINT_PAGINATE_INVALID_VALUE = 'ANTLR_504';
    static readonly LINT_DEBUG_DATA_EXPOSED = 'ANTLR_505';
    static readonly LINT_DOUBLE_COLON_IN_TAG_IDENTIFIER = 'ANTLR_506';
    static readonly LINT_MIXED_MODIFIERS = 'ANTLER_507';
	static readonly LINT_MODIFIER_UNEXPECTED_TYPE = 'ANTLR_508';
}