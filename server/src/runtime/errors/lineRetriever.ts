import { AbstractNode, VariableNode, NumberNode, StringValueNode, ModifierNameNode, ModifierValueNode, TupleListStart, LogicalXorOperator, NullConstant, TrueConstant, FalseConstant, LogicalNegationOperator, LanguageOperatorConstruct, ArgSeparator, StatementSeparatorNode, AdditionAssignmentOperator, AdditionOperator, SubtractionAssignmentOperator, SubtractionOperator, ExponentiationOperator, MultiplicationAssignmentOperator, MultiplicationOperator, DivisionAssignmentOperator, DivisionOperator, ModulusAssignmentOperator, ModulusOperator, SpaceshipCompOperator, LessThanEqualCompOperator, LessThanCompOperator, GreaterThanEqualCompOperator, GreaterThanCompOperator, LeftAssignmentOperator, StrictEqualCompOperator, EqualCompOperator, LogicalAndOperator, ModifierSeparator, LogicalOrOperator, NotStrictEqualCompOperator, NotEqualCompOperator, ConditionalVariableFallbackOperator, NullCoalesceOperator, InlineTernarySeparator, LogicGroupBegin, LogicGroupEnd, ModifierValueSeparator, InlineBranchSeparator, FactorialOperator, ScopeAssignmentOperator, StringConcatenationOperator, MethodInvocationNode, AntlersNode } from '../nodes/abstractNode.js';

export class LineRetriever {
    static getNearText(node: AbstractNode) {
        if (node instanceof VariableNode) {
            return node.name;
        } else if (node instanceof NumberNode) {
            return node.value?.toString() ?? '';
        } else if (node instanceof StringValueNode) {
            return node.value;
        } else if (node instanceof ModifierNameNode) {
            return node.name;
        } else if (node instanceof ModifierValueNode) {
            return node.value;
        } else if (node instanceof TupleListStart) {
            return node.content;
        }

        // Simply dump the original content for these lexer/parser types.
        if (node instanceof LogicalXorOperator ||
            node instanceof NullConstant || node instanceof TrueConstant || node instanceof FalseConstant ||
            node instanceof LogicalNegationOperator || node instanceof LanguageOperatorConstruct ||
            node instanceof ArgSeparator || node instanceof StatementSeparatorNode || node instanceof AdditionAssignmentOperator ||
            node instanceof AdditionOperator || node instanceof SubtractionAssignmentOperator || node instanceof SubtractionOperator ||
            node instanceof ExponentiationOperator || node instanceof MultiplicationAssignmentOperator || node instanceof MultiplicationOperator ||
            node instanceof DivisionAssignmentOperator || node instanceof DivisionOperator || node instanceof ModulusAssignmentOperator ||
            node instanceof ModulusOperator || node instanceof SpaceshipCompOperator || node instanceof LessThanEqualCompOperator ||
            node instanceof LessThanCompOperator || node instanceof GreaterThanEqualCompOperator || node instanceof GreaterThanCompOperator ||
            node instanceof LeftAssignmentOperator || node instanceof StrictEqualCompOperator || node instanceof EqualCompOperator ||
            node instanceof LogicalAndOperator || node instanceof ModifierSeparator || node instanceof LogicalOrOperator ||
            node instanceof NotStrictEqualCompOperator || node instanceof NotEqualCompOperator || node instanceof ConditionalVariableFallbackOperator ||
            node instanceof NullCoalesceOperator || node instanceof InlineTernarySeparator || node instanceof LogicGroupBegin ||
            node instanceof LogicGroupEnd || node instanceof ModifierValueSeparator || node instanceof InlineBranchSeparator ||
            node instanceof FactorialOperator || node instanceof ScopeAssignmentOperator || node instanceof StringConcatenationOperator ||
            node instanceof MethodInvocationNode) {
            return node.content;
        }

        let text = '';

        if (node instanceof AntlersNode) {
            if (node.originalNode != null) {
                text = node.originalNode.getContent();
            } else {
                text = node.startPosition?.line.toString() ?? '';
            }
        } else {
            if (node.originalAbstractNode != null) {
                text = node.originalAbstractNode.rawContent();
            } else {
                text = node.rawContent();
            }
        }

        if (text.length > 15) {
            text = text.substr(0, -15);
        }

        return text;
    }
}