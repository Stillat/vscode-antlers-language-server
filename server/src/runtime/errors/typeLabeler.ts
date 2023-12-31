import { AbstractNode, LanguageOperatorConstruct, AdditionOperator, VariableNode, StringValueNode, NumberNode, FalseConstant, NullConstant, TrueConstant, ModifierNode, ModifierChainNode, ModifierParameterNode, DivisionOperator, ExponentiationOperator, ModulusOperator, MultiplicationOperator, SubtractionOperator, AdditionAssignmentOperator, DivisionAssignmentOperator, ModulusAssignmentOperator, MultiplicationAssignmentOperator, LeftAssignmentOperator, SubtractionAssignmentOperator, EqualCompOperator, StrictEqualCompOperator, GreaterThanCompOperator, GreaterThanEqualCompOperator, LessThanCompOperator, LessThanEqualCompOperator, NotEqualCompOperator, NotStrictEqualCompOperator, SpaceshipCompOperator, ConditionalVariableFallbackOperator, ConditionalFallbackGroup, InlineBranchSeparator, InlineTernarySeparator, LogicGroupBegin, LogicGroupEnd, ModifierSeparator, ModifierNameNode, ModifierValueNode, ModifierValueSeparator, NullCoalescenceGroup, SemanticGroup, StatementSeparatorNode, TernaryCondition, LogicalAndOperator, LogicalNegationOperator, LogicalOrOperator, LogicalXorOperator, NullCoalesceOperator, ParameterNode, PathNode, FactorialOperator, RecursiveNode, ArgumentGroup, ArgSeparator, StringConcatenationOperator, ScopeAssignmentOperator, SwitchCase, SwitchGroup, DirectionGroup, ScopedLogicGroup, LogicGroup, ValueDirectionNode, ArrayNode, TupleListStart, TupleList, MethodInvocationNode } from '../nodes/abstractNode.js';

export class TypeLabeler {
    static readonly TOKEN_LANG_OPERATOR = 'T_LANG_OPERATOR';
    static readonly TOKEN_VARIABLE = 'T_VAR';
    static readonly TOKEN_NUMBER = 'T_NUMERIC';
    static readonly TOKEN_STRING = 'T_STRING';
    static readonly TOKEN_RECURSIVE = 'T_RECURSIVE';
    static readonly TOKEN_CONSTANT_FALSE = 'T_FALSE';
    static readonly TOKEN_CONSTANT_NULL = 'T_NULL';
    static readonly TOKEN_CONSTANT_TRUE = 'T_TRUE';
    static readonly TOKEN_MODIFIER_NODE = 'T_MODIFIER';
    static readonly TOKEN_MODIFIER_CHAIN = 'T_MODIFIER_CHAIN';
    static readonly TOKEN_MODIFIER_PARAMETER = 'T_MODIFIER_PARAM';
    static readonly TOKEN_OP_A_ADD = 'T_AOP_ADD';
    static readonly TOKEN_OP_A_DIVIDE = 'T_AOP_DIVIDE';
    static readonly TOKEN_OP_A_EXPONENTIATION = 'T_AOP_EXP';
    static readonly TOKEN_OP_A_MODULUS = 'T_AOP_MOD';
    static readonly TOKEN_OP_A_MULTIPLY = 'T_AOP_MULTIPLY';
    static readonly TOKEN_OP_A_SUBTRACT = 'T_AOP_SUBTRACT';
    static readonly TOKEN_OP_A_FACTORIAL = 'T_AOP_FACTORIAL';
    static readonly TOKEN_ASG_ADD = 'T_ASG_ADD';
    static readonly TOKEN_ASG_DIVIDE = 'T_ASG_DIVIDE';
    static readonly TOKEN_ASG_ASSIGN = 'T_ASG';
    static readonly TOKEN_ASG_MODULUS = 'T_ASG_MODULUS';
    static readonly TOKEN_ASG_MULTIPLY = 'T_ASG_MULTIPLY';
    static readonly TOKEN_ASG_SUBTRACT = 'T_ASG_SUBTRACT';
    static readonly TOKEN_CMP_EQUAL = 'T_CMP_EQ';
    static readonly TOKEN_CMP_SEQUAL = 'T_CMP_SEQ';
    static readonly TOKEN_CMP_GT = 'T_CMP_GT';
    static readonly TOKEN_CMP_GTE = 'T_CMP_GTE';
    static readonly TOKEN_CMP_LT = 'T_CMP_LT';
    static readonly TOKEN_CMP_LTE = 'T_CMP_LTE';
    static readonly TOKEN_CMP_NEQ = 'T_CMP_NEQ';
    static readonly TOKEN_CMP_SNEQ = 'T_CMP_SNEQ';
    static readonly TOKEN_CMP_SPACESHIP = 'T_CMP_SPSHP';
    static readonly TOKEN_OP_VARIABLE_FALLBACK = 'T_VFBK';
    static readonly TOKEN_COND_FALLBACK_GROUP = 'T_VFBK_GROUP';
    static readonly TOKEN_BRANCH_SEPARATOR = 'T_BRANCH_SEPARATOR';
    static readonly TOKEN_TERNARY_SEPARATOR = 'T_TERNARY_SEPARATOR';
    static readonly TOKEN_GROUP_BEGIN = 'T_LOGIC_BEGIN';
    static readonly TOKEN_GROUP_END = 'T_LOGIC_END';
    static readonly TOKEN_MODIFIER_SEPARATOR = 'T_MODIFIER_SEPARATOR';
    static readonly TOKEN_MODIFIER_NAME = 'T_MODIFIER_NAME';
    static readonly TOKEN_MODIFIER_VALUE = 'T_MODIFIER_VALUE';
    static readonly TOKEN_MODIFIER_VALUE_SEPARATOR = 'T_MODIFIER_VALUE_SEPARATOR';
    static readonly TOKEN_NULL_COALESCE_GROUP = 'T_NULL_COALESCE_GROUP';
    static readonly TOKEN_SEMANTIC_GROUP = 'T_SEMANTIC_GROUP';
    static readonly TOKEN_STATEMENT_SEPARATOR = 'T_STATEMENT_SEPARATOR';
    static readonly TOKEN_TERNARY_CONDITION = 'T_TERNARY_CONDITION';
    static readonly TOKEN_OP_AND = 'T_AND';
    static readonly TOKEN_OP_LOGIC_NEGATION = 'T_LOGIC_INVERSE';
    static readonly TOKEN_OP_OR = 'T_OR';
    static readonly TOKEN_OP_XOR = 'T_XOR';
    static readonly TOKEN_OP_NULL_COALESCE = 'T_NULL_COALESCE';
    static readonly TOKEN_PARAM = 'T_PARAM';
    static readonly TOKEN_PATH_ACCESSOR = 'T_VAR_SEPARATOR';
    static readonly TOKEN_ARG_GROUP = 'T_ARG_GROUP';
    static readonly TOKEN_ARG_SEPARATOR = 'T_ARG_SEPARATOR';
    static readonly TOKEN_OP_STRING_CONCAT = 'T_STR_CONCAT';
    static readonly TOKEN_OP_SCOPE_REASSIGNMENT = 'T_SCOPE_ASSIGNMENT';

    static readonly TOKEN_STRUCT_SWITCH_CASE = 'T_SWITCH_CASE';
    static readonly TOKEN_STRUCT_SWITCH_GROUP = 'T_SWITCH_GROUP';

    static readonly TOKEN_STRUCT_DIRECTION_GROUP = 'T_DIRECTION_GROUP';
    static readonly TOKEN_STRUCT_VALUE_DIRECTION = 'T_ORDER_DIRECTION';
    static readonly TOKEN_STRUCT_SCOPED_LOGIC_GROUP = 'T_SCOPED_LOGIC_GROUP';
    static readonly TOKEN_STRUCT_LOGIC_GROUP = 'T_LOGIC_GROUP';
    static readonly TOKEN_STRUCT_ARRAY = 'T_ARRAY';
    static readonly TOKEN_STRUCT_T_LIST_START = 'T_LIST_START';
    static readonly TOKEN_STRUCT_TUPLE_LIST = 'T_LIST';
    static readonly TOKEN_STRUCT_METHOD_CALL = 'T_METHOD_CALL';

    static getPrettyTypeName(token: AbstractNode) {
        if (token instanceof LanguageOperatorConstruct) {
            return TypeLabeler.TOKEN_LANG_OPERATOR;
        } else if (token instanceof AdditionOperator) {
            return TypeLabeler.TOKEN_OP_A_ADD;
        } else if (token instanceof VariableNode) {
            return TypeLabeler.TOKEN_VARIABLE;
        } else if (token instanceof StringValueNode) {
            return TypeLabeler.TOKEN_STRING;
        } else if (token instanceof NumberNode) {
            return TypeLabeler.TOKEN_NUMBER;
        } else if (token instanceof FalseConstant) {
            return TypeLabeler.TOKEN_CONSTANT_FALSE;
        } else if (token instanceof NullConstant) {
            return TypeLabeler.TOKEN_CONSTANT_NULL;
        } else if (token instanceof TrueConstant) {
            return TypeLabeler.TOKEN_CONSTANT_TRUE;
        } else if (token instanceof ModifierNode) {
            return TypeLabeler.TOKEN_MODIFIER_NODE;
        } else if (token instanceof ModifierChainNode) {
            return TypeLabeler.TOKEN_MODIFIER_CHAIN;
        } else if (token instanceof ModifierParameterNode) {
            return TypeLabeler.TOKEN_MODIFIER_PARAMETER;
        } else if (token instanceof DivisionOperator) {
            return TypeLabeler.TOKEN_OP_A_DIVIDE;
        } else if (token instanceof ExponentiationOperator) {
            return TypeLabeler.TOKEN_OP_A_EXPONENTIATION;
        } else if (token instanceof ModulusOperator) {
            return TypeLabeler.TOKEN_OP_A_MODULUS;
        } else if (token instanceof MultiplicationOperator) {
            return TypeLabeler.TOKEN_OP_A_MULTIPLY;
        } else if (token instanceof SubtractionOperator) {
            return TypeLabeler.TOKEN_OP_A_SUBTRACT;
        } else if (token instanceof AdditionAssignmentOperator) {
            return TypeLabeler.TOKEN_ASG_ADD;
        } else if (token instanceof DivisionAssignmentOperator) {
            return TypeLabeler.TOKEN_ASG_DIVIDE;
        } else if (token instanceof ModulusAssignmentOperator) {
            return TypeLabeler.TOKEN_ASG_MODULUS;
        } else if (token instanceof MultiplicationAssignmentOperator) {
            return TypeLabeler.TOKEN_ASG_MULTIPLY;
        } else if (token instanceof LeftAssignmentOperator) {
            return TypeLabeler.TOKEN_ASG_ASSIGN;
        } else if (token instanceof SubtractionAssignmentOperator) {
            return TypeLabeler.TOKEN_ASG_SUBTRACT;
        } else if (token instanceof EqualCompOperator) {
            return TypeLabeler.TOKEN_CMP_EQUAL;
        } else if (token instanceof StrictEqualCompOperator) {
            return TypeLabeler.TOKEN_CMP_SEQUAL;
        } else if (token instanceof GreaterThanCompOperator) {
            return TypeLabeler.TOKEN_CMP_GT;
        } else if (token instanceof GreaterThanEqualCompOperator) {
            return TypeLabeler.TOKEN_CMP_GTE;
        } else if (token instanceof LessThanCompOperator) {
            return TypeLabeler.TOKEN_CMP_LT;
        } else if (token instanceof LessThanEqualCompOperator) {
            return TypeLabeler.TOKEN_CMP_LTE;
        } else if (token instanceof NotEqualCompOperator) {
            return TypeLabeler.TOKEN_CMP_NEQ;
        } else if (token instanceof NotStrictEqualCompOperator) {
            return TypeLabeler.TOKEN_CMP_SNEQ;
        } else if (token instanceof SpaceshipCompOperator) {
            return TypeLabeler.TOKEN_CMP_SPACESHIP;
        } else if (token instanceof ConditionalVariableFallbackOperator) {
            return TypeLabeler.TOKEN_OP_VARIABLE_FALLBACK;
        } else if (token instanceof ConditionalFallbackGroup) {
            return TypeLabeler.TOKEN_COND_FALLBACK_GROUP;
        } else if (token instanceof InlineBranchSeparator) {
            return TypeLabeler.TOKEN_BRANCH_SEPARATOR;
        } else if (token instanceof InlineTernarySeparator) {
            return TypeLabeler.TOKEN_TERNARY_SEPARATOR;
        } else if (token instanceof LogicGroupBegin) {
            return TypeLabeler.TOKEN_GROUP_BEGIN;
        } else if (token instanceof LogicGroupEnd) {
            return TypeLabeler.TOKEN_GROUP_END;
        } else if (token instanceof ModifierSeparator) {
            return TypeLabeler.TOKEN_MODIFIER_SEPARATOR;
        } else if (token instanceof ModifierNameNode) {
            return TypeLabeler.TOKEN_MODIFIER_NAME;
        } else if (token instanceof ModifierValueNode) {
            return TypeLabeler.TOKEN_MODIFIER_VALUE;
        } else if (token instanceof ModifierValueSeparator) {
            return TypeLabeler.TOKEN_MODIFIER_VALUE_SEPARATOR;
        } else if (token instanceof NullCoalescenceGroup) {
            return TypeLabeler.TOKEN_NULL_COALESCE_GROUP;
        } else if (token instanceof SemanticGroup) {
            return TypeLabeler.TOKEN_SEMANTIC_GROUP;
        } else if (token instanceof StatementSeparatorNode) {
            return TypeLabeler.TOKEN_STATEMENT_SEPARATOR;
        } else if (token instanceof TernaryCondition) {
            return TypeLabeler.TOKEN_TERNARY_CONDITION;
        } else if (token instanceof LogicalAndOperator) {
            return TypeLabeler.TOKEN_OP_AND;
        } else if (token instanceof LogicalNegationOperator) {
            return TypeLabeler.TOKEN_OP_LOGIC_NEGATION;
        } else if (token instanceof LogicalOrOperator) {
            return TypeLabeler.TOKEN_OP_OR;
        } else if (token instanceof LogicalXorOperator) {
            return TypeLabeler.TOKEN_OP_XOR;
        } else if (token instanceof NullCoalesceOperator) {
            return TypeLabeler.TOKEN_OP_NULL_COALESCE;
        } else if (token instanceof ParameterNode) {
            return TypeLabeler.TOKEN_PARAM;
        } else if (token instanceof PathNode) {
            return TypeLabeler.TOKEN_PATH_ACCESSOR;
        } else if (token instanceof FactorialOperator) {
            return TypeLabeler.TOKEN_OP_A_FACTORIAL;
        } else if (token instanceof RecursiveNode) {
            return TypeLabeler.TOKEN_RECURSIVE;
        } else if (token instanceof ArgumentGroup) {
            return TypeLabeler.TOKEN_ARG_GROUP;
        } else if (token instanceof ArgSeparator) {
            return TypeLabeler.TOKEN_ARG_SEPARATOR;
        } else if (token instanceof StringConcatenationOperator) {
            return TypeLabeler.TOKEN_OP_STRING_CONCAT;
        } else if (token instanceof ScopeAssignmentOperator) {
            return TypeLabeler.TOKEN_OP_SCOPE_REASSIGNMENT;
        } else if (token instanceof SwitchCase) {
            return TypeLabeler.TOKEN_STRUCT_SWITCH_CASE;
        } else if (token instanceof SwitchGroup) {
            return TypeLabeler.TOKEN_STRUCT_SWITCH_GROUP;
        } else if (token instanceof DirectionGroup) {
            return TypeLabeler.TOKEN_STRUCT_DIRECTION_GROUP;
        } else if (token instanceof ScopedLogicGroup) {
            return TypeLabeler.TOKEN_STRUCT_SCOPED_LOGIC_GROUP;
        } else if (token instanceof LogicGroup) {
            return TypeLabeler.TOKEN_STRUCT_LOGIC_GROUP;
        } else if (token instanceof ValueDirectionNode) {
            return TypeLabeler.TOKEN_STRUCT_VALUE_DIRECTION;
        } else if (token instanceof ArrayNode) {
            return TypeLabeler.TOKEN_STRUCT_ARRAY;
        } else if (token instanceof TupleListStart) {
            return TypeLabeler.TOKEN_STRUCT_T_LIST_START;
        } else if (token instanceof TupleList) {
            return TypeLabeler.TOKEN_STRUCT_TUPLE_LIST;
        } else if (token instanceof MethodInvocationNode) {
            return TypeLabeler.TOKEN_STRUCT_METHOD_CALL;
        }
        return typeof token;
    }
}