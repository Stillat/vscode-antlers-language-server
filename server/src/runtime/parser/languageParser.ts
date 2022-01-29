import { AntlersError } from '../errors/antlersError';
import { AntlersErrorCodes } from '../errors/antlersErrorCodes';
import { LineRetriever } from '../errors/lineRetriever';
import { TypeLabeler } from '../errors/typeLabeler';
import { AbstractNode, AdditionAssignmentOperator, AdditionOperator, AliasedScopeLogicGroup, AntlersNode, ArgSeparator, ArgumentGroup, ArrayNode, ConditionalVariableFallbackOperator, DirectionGroup, DivisionAssignmentOperator, DivisionOperator, EqualCompOperator, ExponentiationOperator, FactorialOperator, FalseConstant, GreaterThanCompOperator, GreaterThanEqualCompOperator, InlineBranchSeparator, InlineTernarySeparator, LanguageOperatorConstruct, LeftAssignmentOperator, LessThanCompOperator, LessThanEqualCompOperator, LibraryInvocationConstruct, ListValueNode, LogicalAndOperator, LogicalNegationOperator, LogicalOrOperator, LogicalXorOperator, LogicGroup, LogicGroupBegin, LogicGroupEnd, MethodInvocationNode, ModifierChainNode, ModifierNameNode, ModifierNode, ModifierSeparator, ModifierValueNode, ModifierValueSeparator, ModulusAssignmentOperator, ModulusOperator, MultiplicationAssignmentOperator, MultiplicationOperator, NamedArgumentNode, NameValueNode, NotEqualCompOperator, NotStrictEqualCompOperator, NullCoalescenceGroup, NullCoalesceOperator, NullConstant, NumberNode, PathNode, ScopeAssignmentOperator, ScopedLogicGroup, SemanticGroup, SpaceshipCompOperator, StatementSeparatorNode, StrictEqualCompOperator, StringConcatenationOperator, StringValueNode, SubtractionAssignmentOperator, SubtractionOperator, SwitchCase, SwitchGroup, TernaryCondition, TrueConstant, TupleListStart, TupleScopedLogicGroup, ValueDirectionNode, VariableNode } from '../nodes/abstractNode';
import { LibraryManager } from '../runtime/libraries/libraryManager';
import { LanguageOperatorRegistry } from '../runtime/sandbox/languageOperatorRegistry';
import { NodeHelpers } from '../utilities/nodeHelpers';
import { StringUtilities } from '../utilities/stringUtilities';
import { DocumentParser } from './documentParser';
import { LanguageKeywords } from './languageKeywords';
import { PathParser } from './pathParser';

export class LanguageParser {
	private pathParser: PathParser = new PathParser();
	protected tokens: AbstractNode[] = [];

	private createdModifierChains: ModifierChainNode[] = [];
	private createdLanguageOperators: LanguageOperatorConstruct[] = [];
	private createdArrays: ArrayNode[] = [];
	private mergedVariablePaths: VariableNode[] = [];
	private mergedComponents: Map<AbstractNode, VariableNode> = new Map();
	private modifierNameMapping: Map<ModifierNameNode, ModifierNode> = new Map();
	private isRealModifierSeparator: Map<AbstractNode, boolean> = new Map();
	private isRoot = true;
	private retriggerNonVirtualGroupMembers:AbstractNode[][] = [];

	public hasModifierConstruct(name: ModifierNameNode): boolean {
		return this.modifierNameMapping.has(name);
	}

	public getModifierConstruct(name: ModifierNameNode): ModifierNode {
		return this.modifierNameMapping.get(name) as ModifierNode;
	}

	public isActualModifierSeparator(node: AbstractNode): boolean {
		return this.isRealModifierSeparator.has(node);
	}

	public isMergedVariableComponent(node: AbstractNode): boolean {
		return this.mergedComponents.has(node);
	}

	public getMergedVariable(node: AbstractNode): VariableNode {
		return this.mergedComponents.get(node) as VariableNode;
	}

	public getMergedVariablePaths(): VariableNode[] {
		return this.mergedVariablePaths;
	}

	public getCreatedModifierChains(): ModifierChainNode[] {
		return this.createdModifierChains;
	}

	public getCreatedLangaugeOperators(): LanguageOperatorConstruct[] {
		return this.createdLanguageOperators;
	}

	public getCreatedArrays(): ArrayNode[] {
		return this.createdArrays;
	}

	reset() {
		this.tokens = [];
		this.createdModifierChains = [];
		this.createdLanguageOperators = [];
		this.createdArrays = [];
		this.createdModifierChains = [];
		this.createdLanguageOperators = [];
		this.createdArrays = [];
		this.mergedVariablePaths = [];
		this.mergedComponents.clear();
		this.modifierNameMapping.clear();
	}

	parse(tokens: AbstractNode[]) {
		this.tokens = tokens;

		this.tokens = this.combineVariablePaths(this.tokens);

		this.tokens = this.createLanguageOperators(this.tokens);
		this.tokens = this.createLogicalGroups(this.tokens);
		this.tokens = this.associateMethodCalls(this.tokens);
		this.tokens = this.createTupleLists(this.tokens);

		this.tokens = this.createLibraryInvocations(this.tokens);
		this.tokens = this.associateModifiers(this.tokens);
		this.tokens = this.createNullCoalescenceGroups(this.tokens);

		// With modifiers and variables accounted for, this will
		// rewrite some tokens to a more "correct" type based
		// on the now more well-known context.
		this.tokens = this.correctTypes(this.tokens);

		this.tokens = this.createTernaryGroups(this.tokens);
		this.tokens = this.applyOperationOrder(this.tokens);
		this.validateNeighboringOperators(this.tokens);

		this.tokens = this.createLogicGroupsToRemoveMethodInvocationAmbiguity(this.tokens);
		this.tokens = this.createLogicGroupsToResolveOperatorAmbiguity(this.tokens);
		this.validateNoDanglingLogicGroupEnds(this.tokens);

		if (this.isRoot) {
			this.tokens = this.insertAutomaticStatementSeparators(this.tokens);

			if (this.retriggerNonVirtualGroupMembers.length > 0) {
				this.retriggerNonVirtualGroupMembers.forEach((grouping) => {
					this.markAllNonVirtualAsListGroupMember(grouping);
				});
			}
		}

		return this.createSemanticGroups(this.tokens);
	}

	setIsRoot(isRoot: boolean) {
		this.isRoot = isRoot;

		return this;
	}

	private validateNeighboringOperators(tokens: AbstractNode[]) {
		const tokenCount = tokens.length;

		for (let i = 0; i < tokenCount; i++) {
			const thisToken = tokens[i];

			if (LanguageParser.isOperatorType(thisToken)) {
				if (i + 1 >= tokenCount) {
					thisToken.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_OPERATOR,
						thisToken,
						'Unexpected operator while parsing input text.'
					));
					return;
				}

				const peek = tokens[i + 1];

				if (LanguageParser.isOperatorType(peek)) {
					peek.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_OPERATOR_INVALID_ON_RIGHT,
						peek,
						'Unexpected operator while parsing input text.'
					));
					continue;
				}
			}
		}
	}

	static isAssignmentOperator(token: AbstractNode) {
		if (token instanceof AdditionAssignmentOperator ||
			token instanceof DivisionAssignmentOperator || token instanceof LeftAssignmentOperator ||
			token instanceof ModulusAssignmentOperator || token instanceof MultiplicationAssignmentOperator ||
			token instanceof SubtractionAssignmentOperator) {
			return true;
		}

		return false;
	}

	static isOperatorType(token: AbstractNode) {
		if (token instanceof AdditionAssignmentOperator ||
			token instanceof DivisionAssignmentOperator ||
			token instanceof LeftAssignmentOperator ||
			token instanceof ModulusAssignmentOperator ||
			token instanceof MultiplicationAssignmentOperator ||
			token instanceof SubtractionAssignmentOperator ||
			token instanceof ConditionalVariableFallbackOperator ||
			token instanceof LanguageOperatorConstruct ||
			token instanceof LogicalAndOperator ||
			token instanceof LogicalNegationOperator ||
			token instanceof LogicalOrOperator ||
			token instanceof LogicalXorOperator ||
			token instanceof NullCoalesceOperator ||
			token instanceof StringConcatenationOperator ||
			token instanceof AdditionOperator ||
			token instanceof DivisionOperator ||
			token instanceof ExponentiationOperator ||
			token instanceof ModulusOperator ||
			token instanceof MultiplicationOperator ||
			token instanceof SubtractionOperator ||
			token instanceof EqualCompOperator ||
			token instanceof GreaterThanCompOperator ||
			token instanceof GreaterThanEqualCompOperator ||
			token instanceof LessThanCompOperator ||
			token instanceof LessThanEqualCompOperator ||
			token instanceof NotEqualCompOperator ||
			token instanceof NotStrictEqualCompOperator ||
			token instanceof SpaceshipCompOperator ||
			token instanceof StrictEqualCompOperator) {
			return true;
		}
		return false;
	}

	private markAllNonVirtualAsListGroupMember(nodes: AbstractNode[]) {
		nodes.forEach((node) => {
			if (node instanceof LogicGroup|| node instanceof ScopedLogicGroup || node instanceof AliasedScopeLogicGroup) {
				if (node.start != null && node.start.isVirtual == false) {
					node.start.isListGroupMember = true;
				}

				if (node.end != null && node.end.isVirtual == false) {
					node.end.isListGroupMember = true;
				}

				if (node.scopeOperator != null) {
					node.scopeOperator.isListGroupMember = true;
				}

				node.nodes.forEach((lgNode) => {
					this.markAllNonVirtualAsListGroupMember([lgNode]);
				});
				return;
			} else if (node instanceof SemanticGroup) {
				if (node.separatorToken != null && node.separatorToken.isVirtual == false) {
					node.separatorToken.isListGroupMember = true;
				}

				this.markAllNonVirtualAsListGroupMember(node.nodes);
			}

			if (node.isVirtual == false) {
				node.isListGroupMember = true;
			}

			if (node.originalAbstractNode != null && node.originalAbstractNode != node) {
				this.markAllNonVirtualAsListGroupMember([node.originalAbstractNode]);
			}
		});
	}

	private markAllNonVirtualAsSwitch(nodes: AbstractNode[]) {
		nodes.forEach((node) => {
			if (node instanceof LogicGroup|| node instanceof ScopedLogicGroup || node instanceof AliasedScopeLogicGroup) {
				if (node.start != null && node.start.isVirtual == false) {
					node.start.isSwitchGroupMember = true;
				}

				if (node.end != null && node.end.isVirtual == false) {
					node.end.isSwitchGroupMember = true;
				}

				if (node.scopeOperator != null) {
					node.scopeOperator.isSwitchGroupMember = true;
				}

				node.nodes.forEach((lgNode) => {
					this.markAllNonVirtualAsSwitch([lgNode]);
				});
				return;
			} else if (node instanceof SemanticGroup) {
				if (node.separatorToken != null && node.separatorToken.isVirtual == false) {
					node.separatorToken.isSwitchGroupMember = true;
				}

				this.markAllNonVirtualAsSwitch(node.nodes);
			}

			if (node.isVirtual == false) {
				node.isSwitchGroupMember = true;
			}

			if (node.originalAbstractNode != null && node.originalAbstractNode != node) {
				this.markAllNonVirtualAsSwitch([node.originalAbstractNode]);
			}
		});
	}

	private validateNoDanglingLogicGroupEnds(tokens: AbstractNode[]) {
		tokens.forEach((token) => {
			if (token instanceof LogicGroupEnd) {
				token.pushError(AntlersError.makeSyntaxError(
					AntlersErrorCodes.TYPE_LOGIC_GROUP_NO_START,
					token,
					'Unexpected [T_LOGIC_END] while parsing input text.'
				));
			}
		});
	}

	private isValidModifierValue(node: AbstractNode) {
		if (node instanceof ModifierValueNode ||
			node instanceof VariableNode ||
			node instanceof TrueConstant ||
			node instanceof FalseConstant ||
			node instanceof NullConstant ||
			node instanceof NumberNode ||
			node instanceof StringValueNode) {
			return true;
		}

		return false;
	}

	private wrapNumberInVariable(node: NumberNode) {
		const variableNode = new VariableNode();
		variableNode.startPosition = node.startPosition;
		variableNode.endPosition = node.endPosition;
		variableNode.name = node.value?.toString() ?? '';
		variableNode.content = node.value?.toString() ?? '';
		variableNode.originalAbstractNode = node;
		variableNode.refId = node.refId;
		variableNode.modifierChain = node.modifierChain;
		variableNode.index = node.index;

		return variableNode;
	}

	private wrapArithmeticModifier(operator: AbstractNode, modifierName: string) {
		const node = new ModifierNameNode();
		node.startPosition = operator.startPosition;
		node.endPosition = operator.endPosition;
		node.originalAbstractNode = operator;
		node.content = modifierName;
		node.name = modifierName;
		node.index = operator.index;

		return node;
	}

	private combineVariablePaths(tokens: AbstractNode[]) {
		const newNodes: AbstractNode[] = [],
			tokenCount = tokens.length;

		for (let i = 0; i < tokenCount; i++) {
			const node = tokens[i],
				newNodeCount = newNodes.length;

			if (node instanceof InlineBranchSeparator) {
				if (newNodeCount == 0) {
					node.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_BRANCH_SEPARATOR_FOR_VARCOMBINE,
						node,
						'Unexpected [T_BRANCH_SEPARATOR] while parsing input text.'
					));
					continue;
				}

				if (i + 1 > tokenCount) {
					let lastNodeText = '';

					if (i > 0) {
						const lastNode = tokens[i - 1];
						lastNodeText = LineRetriever.getNearText(lastNode);
					}

					node.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_EOI_PARSING_BRANCH_GROUP,
						node,
						'Unexpected end of input while parsing input text near "' + lastNodeText + LineRetriever.getNearText(node) + '".'
					));
					continue;
				}

				const left = newNodes[newNodeCount - 1];
				let right = tokens[i + 1];


				if (right instanceof NumberNode && NodeHelpers.distance(left, right) == 1) {
					right = this.wrapNumberInVariable(right);
				}

				if (left instanceof VariableNode && right instanceof VariableNode && NodeHelpers.distance(left, right) == 1) {
					// Note: It is important when we do this merge
					// that we start from the right, and merge
					// the closest left node and work back.
					// The right-most node may have a
					// valid modifier chain on it.

					// Remove the var off the stack.
					newNodes.pop();
					NodeHelpers.mergeVarContentRight(':', node, right);
					NodeHelpers.mergeVarRight(left, right);

					newNodes.push(right);

					this.mergedVariablePaths.push(right);
					this.mergedComponents.set(node, right);
					this.mergedComponents.set(left, right);
					this.mergedComponents.set(right, right);
					// Skip over the adjusted right.
					i += 1;
					continue;
				} else {
					newNodes.push(node);
					continue;
				}
			} else if (node instanceof StringValueNode && newNodeCount > 0) {
				if ((i + 1) >= tokenCount) {
					newNodes.push(node);
					continue;
				}

				const left = newNodes[newNodeCount - 1],
					right = tokens[i + 1];

				if (left instanceof VariableNode && right instanceof VariableNode && NodeHelpers.distance(left, node) <= 1 && NodeHelpers.distance(node, right) <= 1) {
					newNodes.pop();

					NodeHelpers.mergeVarContentLeft(node.sourceTerminator + node.value + node.sourceTerminator, node, left);
					NodeHelpers.mergeVarContentLeft(right.name, right, left);

					newNodes.push(left);
					this.mergedVariablePaths.push(left);
					this.mergedComponents.set(node, left);
					this.mergedComponents.set(left, left);
					this.mergedComponents.set(right, left);
					i += 1;
					continue;
				} else {
					newNodes.push(node);
				}
			} else {
				newNodes.push(node);
			}
		}


		newNodes.forEach((node) => {
			if (node instanceof VariableNode) {
				node.variableReference = this.pathParser.parse(node.name);
				node.mergeErrors(this.pathParser.getAntlersErrors());
			}
		});

		return newNodes;
	}

	private convertVarNodeToOperator(variable: VariableNode) {
		const operator = new LanguageOperatorConstruct();
		operator.content = variable.name;
		operator.startPosition = variable.startPosition;
		operator.endPosition = variable.endPosition;
		operator.originalAbstractNode = variable;
		variable.convertedToOperator = true;
		this.createdLanguageOperators.push(operator);

		return operator;
	}

	private convertOperatorToVarNode(operator: LanguageOperatorConstruct) {
		const varNodeWrap = new VariableNode();
		varNodeWrap.startPosition = operator.startPosition;
		varNodeWrap.endPosition = operator.endPosition;
		varNodeWrap.content = operator.content;
		varNodeWrap.name = operator.content;
		varNodeWrap.originalAbstractNode = operator;

		return varNodeWrap;
	}

	private createLanguageOperators(tokens: AbstractNode[]) {
		const nodeCount = tokens.length;

		for (let i = 0; i < nodeCount; i++) {
			const thisNode = tokens[i];

			if (thisNode instanceof VariableNode) {
				if (thisNode.name.includes(DocumentParser.Punctuation_FullStop)) {
					const checkParts = thisNode.name.split(DocumentParser.Punctuation_FullStop) as string[];

					if (LanguageOperatorRegistry.operators.includes(checkParts[0]) ||
						LibraryManager.deferredCoreLibraries.includes(checkParts[0])) {
						tokens[i] = this.convertVarNodeToOperator(thisNode);
						continue;
					}
				}

				if (LanguageOperatorRegistry.operators.includes(thisNode.name)) {
					tokens[i] = this.convertVarNodeToOperator(thisNode);
					continue;
				}
			}

			if (thisNode instanceof LanguageOperatorConstruct) {
				if (i + 1 >= nodeCount) {
					tokens[i] = this.convertOperatorToVarNode(thisNode);
					continue;
				}

				const next = tokens[i + 1];

				if (next instanceof StatementSeparatorNode) {
					tokens[i] = this.convertOperatorToVarNode(thisNode);
					continue;
				}
			}
		}

		return tokens;
	}

	private createLogicalGroups(tokens: AbstractNode[]) {
		const groupedTokens: AbstractNode[] = [],
			tokenCount = tokens.length;
		const negatedGroupedTokens: AbstractNode[] = [];

		for (let i = 0; i < tokenCount; i++) {
			const token = tokens[i];

			if (token instanceof LogicalNegationOperator) {
				const negationCount = this.countTypeRight(tokens, i, LogicalNegationOperator);

				if (negatedGroupedTokens.length == 0 && tokens.length == negationCount) {
					token.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_LOGIC_NEGATION_OPERATOR,
						token,
						'Unexpected [T_LOGIC_INVERSE] while parsing input text.'
					));
					continue;
				}

				if (i > 0 && negatedGroupedTokens.length > 0) {
					const prev = negatedGroupedTokens[negatedGroupedTokens.length - 1];

					if (prev instanceof NumberNode || prev instanceof LogicGroupEnd || prev instanceof LogicGroup) {
						if (prev instanceof LogicGroup) {
							if (prev.start instanceof LogicalNegationOperator) {
								prev.start.pushError(AntlersError.makeSyntaxError(
									AntlersErrorCodes.TYPE_FACTORIAL_MATERIALIZED_BOOL_DETECTED,
									prev.start,
									'[T_AOP_FACTORIAL] operand will always materialize boolean type.'
								));
								continue;
							}
						}

						const factorialOperator = new FactorialOperator();
						factorialOperator.startPosition = token.startPosition;
						factorialOperator.endPosition = token.endPosition;
						factorialOperator.content = '!'.repeat(negationCount);
						factorialOperator.originalAbstractNode = token;
						factorialOperator.repeat = negationCount;

						negatedGroupedTokens.push(factorialOperator);

						if (negationCount > 0) {
							i += negationCount - 1;
						}

						continue;
					}
				}

				// Just ignore these at the parser level.
				// An even number of negation operators are the same has having no negation operators.
				if (negationCount % 2 == 0) {
					i += negationCount - 1;
					continue;
				}

				// We want to peek to the one after the last negation operator.
				const peek = tokens[i + negationCount];

				if (peek instanceof LogicGroupBegin) {
					// Scan right to count the negations.
					const targetSliceOffset = i + negationCount + 1;

					if (targetSliceOffset >= tokenCount) {
						peek.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_PARSING_LOGIC_GROUP_NEGATION_OFFSET,
							peek,
							'Unexpected end of input while parsing input text.'
						));
						continue;
					}

					const groupResults = this.findLogicalGroupEnd(tokens[i + negationCount], tokens.slice(targetSliceOffset));

					if (groupResults.found) {
						const subGroup = groupResults.logicalGroup as LogicGroup;

						const wrapperGroup = new LogicGroup();
						wrapperGroup.start = token;
						wrapperGroup.end = subGroup;
						wrapperGroup.nodes.push(token);
						wrapperGroup.nodes.push(subGroup);
						wrapperGroup.startPosition = token.startPosition;
						wrapperGroup.endPosition = subGroup.endPosition;

						negatedGroupedTokens.push(wrapperGroup);

						i += groupResults.skipCount + negationCount;
					}

					continue;
				}

				const results = this.resolveValueRight(tokens, i);

				if (results.value != null) {
					negatedGroupedTokens.push(results.value);
				}

				i += results.negationCount;
			} else {
				negatedGroupedTokens.push(token);
			}
		}

		const negatedTokenCount = negatedGroupedTokens.length;

		for (let i = 0; i < negatedTokenCount; i++) {
			const token = negatedGroupedTokens[i];

			if (token instanceof LogicGroupBegin) {
				if (i + 1 >= negatedTokenCount) {
					token.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_PARSING_LOGIC_GROUP_END_DUE_TO_NEGATION,
						token,
						'Unexpected end of input while parsing input text.'
					));
					continue;
				}

				const group = this.findLogicalGroupEnd(token, negatedGroupedTokens.slice(i + 1));

				if (group.found && group.logicalGroup != null) {
					groupedTokens.push(group.logicalGroup);
				}

				i += group.skipCount;
			} else {
				if (token instanceof FactorialOperator) {
					if (groupedTokens.length == 0) {
						token.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_UNEXPECTED_FACTORIAL_WHILE_CREATING_GROUPS,
							token,
							'Unexpected [T_AOP_FACTORIAL] while parsing input text.'
						));
						continue;
					}

					let prev = groupedTokens[groupedTokens.length - 1];

					if (prev instanceof LogicGroup == false &&
						prev instanceof NumberNode == false) {
						token.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_UNEXPECTED_FACTORIAL_OPERAND,
							token,
							'Unexpected left operand encountered for [T_AOP_FACTORIAL] while parsing input text.'
						));
						continue;
					}

					prev = groupedTokens.pop() as AbstractNode;
					const wrapperGroup = new LogicGroup();
					wrapperGroup.startPosition = prev.startPosition;
					wrapperGroup.endPosition = token.endPosition;
					wrapperGroup.originalAbstractNode = token;
					wrapperGroup.nodes.push(prev);
					wrapperGroup.nodes.push(token);

					groupedTokens.push(wrapperGroup);
				} else {
					groupedTokens.push(token);
				}
			}
		}

		return groupedTokens;
	}

	private makeArgGroup(nodes: AbstractNode[]) {
		const argGroup = new ArgumentGroup(),
			nodeCount = nodes.length;

		for (let i = 0; i < nodeCount; i++) {
			const thisNode = nodes[i];

			if (this.isOperand(thisNode) == false) {
				thisNode.pushError(AntlersError.makeSyntaxError(
					AntlersErrorCodes.TYPE_UNEXPECTED_TOKEN_WHILE_PARSING_METHOD,
					thisNode,
					'Unexpected [' + TypeLabeler.getPrettyTypeName(thisNode) + '] while parsing argument group.'
				));
				continue;
			}

			let next: AbstractNode | null = null;

			if (i + 1 < nodeCount) {
				next = nodes[i + 1];
			}

			if (next == null || next instanceof ArgSeparator) {
				argGroup.args.push(nodes[i]);
				i += 1;
				continue;
			} else if (next instanceof InlineBranchSeparator) {
				if (i + 2 >= nodeCount) {
					thisNode.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_ARG_UNEXPECTED_NAMED_ARGUMENT,
						thisNode,
						'Unexpected end of input while parsing named argument.'
					));
					continue;
				}

				const valueNode = nodes[i + 2];

				const namedArgument = new NamedArgumentNode();
				namedArgument.startPosition = thisNode.startPosition;
				namedArgument.endPosition = valueNode.endPosition;
				namedArgument.content = thisNode.content + valueNode.content;
				namedArgument.name = thisNode;
				namedArgument.value = valueNode;

				if (thisNode instanceof VariableNode == false) {
					thisNode.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_INVALID_NAMED_ARG_IDENTIFIER,
						thisNode,
						'Invalid type [' + TypeLabeler.getPrettyTypeName(thisNode) + '] supplied for named argument name.'
					));
				}

				argGroup.hasNamedArguments = true;
				argGroup.numberOfNamedArguments += 1;

				argGroup.args.push(namedArgument);

				if (i + 3 < nodeCount && nodes[i + 3] instanceof ArgSeparator) {
					i += 3;
				} else {
					i += 2;
				}

				continue;
			}
		}

		let remainderMustBeNamed = false;

		argGroup.args.forEach((arg) => {
			if (arg instanceof NamedArgumentNode) {
				remainderMustBeNamed = true;
			} else {
				if (remainderMustBeNamed) {
					arg.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_UNNAMED_METHOD_ARGUMENT,
						arg,
						'Unnamed arguments are not allowed to appear after a named argument.'
					));
				}
			}
		});

		return argGroup;
	}

	private cleanVariableForMethodInvocation(node: VariableNode) {
		if (node.name.startsWith(':') || node.name.startsWith('.')) {
			node.name = node.name.substr(1);

			if (node.variableReference != null) {
				node.variableReference.originalContent = node.variableReference.originalContent.substr(1);
				node.variableReference.normalizedReference = node.variableReference.normalizedReference.substr(1);
			}

			if (node.startPosition != null) {
				node.startPosition.offset += 1;
				node.startPosition.char += 1;
			}
		}
	}

	private reduceVariableReferenceForObjectAccessor(node: VariableNode): ReducedObjectAccessorResult {
		const lastPath = node.variableReference?.pathParts.pop() as PathNode,
			accessor = lastPath.name,
			accessorLen = accessor.length + 1;

		node.name = node.name.substr(0, -accessorLen);

		if (node.variableReference != null) {
			node.variableReference.originalContent = node.variableReference.originalContent.substr(0, -accessorLen);
			node.variableReference.normalizedReference = node.variableReference.normalizedReference.substr(0, -accessorLen);

			node.variableReference.pathParts[node.variableReference.pathParts.length - 1].isFinal = true;
		}

		if (node.endPosition != null) {
			node.endPosition.offset -= accessorLen;
			node.endPosition.char -= accessorLen;
		}

		return {
			accessor: accessor,
			accessorLen: accessorLen
		};
	}

	private associateMethodCalls(tokens: AbstractNode[]) {
		const newTokens: AbstractNode[] = [],
			nodeCount = tokens.length;

		for (let i = 0; i < nodeCount; i++) {
			const thisNode = tokens[i];

			let prevNode: AbstractNode | null = null,
				next: AbstractNode | null = null;

			if (newTokens.length > 0) {
				prevNode = newTokens[newTokens.length - 1];
			}

			if (i + 1 < nodeCount) {
				next = tokens[i + 1];
			}

			if (thisNode instanceof VariableNode &&
				next instanceof LogicGroup && prevNode != null &&
				(
					this.isProperMethodChainTargetStrict(prevNode) ||
					prevNode instanceof InlineBranchSeparator
				)) {
				const argGroup = next;
				let argNodes: AbstractNode[] = [];

				if (argGroup.nodes.length > 0) {
					if (argGroup.nodes[0] instanceof SemanticGroup) {
						const tSg = argGroup.nodes[0] as SemanticGroup;
						argNodes = tSg.nodes;
					} else {
						argNodes = argGroup.nodes;
					}
				}

				const methodInvocation = new MethodInvocationNode();
				methodInvocation.startPosition = thisNode.startPosition;

				if (prevNode instanceof InlineBranchSeparator) {
					const branchSeparator = newTokens.pop() as InlineBranchSeparator;
					methodInvocation.startPosition = branchSeparator.startPosition;
				}

				this.cleanVariableForMethodInvocation(thisNode);

				methodInvocation.endPosition = argGroup.endPosition;
				methodInvocation.args = this.makeArgGroup(argNodes);
				methodInvocation.method = thisNode;
				prevNode.methodTarget = methodInvocation;

				if (prevNode instanceof VariableNode && prevNode.mergeRefName.length > 0) {
					prevNode.name = NodeHelpers.getUnrefName(prevNode.mergeRefName);
				}

				newTokens.push(methodInvocation);

				i += 1;
				continue;
			} else if (thisNode instanceof LogicGroup &&
				prevNode instanceof VariableNode &&
				prevNode.variableReference != null && prevNode.variableReference.pathParts.length >= 2) {
				let argNodes: AbstractNode[] = [];

				if (thisNode.nodes.length > 0) {
					if (thisNode.nodes[0] instanceof SemanticGroup) {
						const tSg = thisNode.nodes[0] as SemanticGroup;
						argNodes = tSg.nodes;
					} else {
						argNodes = thisNode.nodes;
					}
				}

				if (prevNode.variableReference.pathParts[0] instanceof PathNode) {
					if (LibraryManager.deferredCoreLibraries.includes(prevNode.variableReference.pathParts[0].name)) {
						const varRef = newTokens.pop() as VariableNode;

						const libraryInvocation = new LibraryInvocationConstruct();
						libraryInvocation.startPosition = varRef.startPosition;
						libraryInvocation.endPosition = thisNode.endPosition;
						libraryInvocation.content = varRef.content;
						libraryInvocation.originalAbstractNode = thisNode;

						const libraryReference = varRef.variableReference?.pathParts.shift() as PathNode;

						const libraryName = libraryReference.name,
							methodName = varRef.variableReference?.implodePaths() as string;

						libraryInvocation.libraryName = libraryName;
						libraryInvocation.methodName = methodName;
						libraryInvocation.arguments = this.makeArgGroup(argNodes);

						newTokens.push(libraryInvocation);

						i += 1;
						continue;
					}
				}

				const reductionResult = this.reduceVariableReferenceForObjectAccessor(prevNode);
				const methodInvocation = new MethodInvocationNode();
				methodInvocation.startPosition = thisNode.startPosition;
				methodInvocation.endPosition = thisNode.endPosition;
				prevNode.methodTarget = methodInvocation;

				if (prevNode instanceof VariableNode && prevNode.mergeRefName.length > 0) {
					prevNode.name = NodeHelpers.getUnrefName(prevNode.mergeRefName);
				}

				if (thisNode.start != null) {
					thisNode.start.isPartOfMethodChain = true;
				}

				if (thisNode.end != null) {
					thisNode.end.isPartOfMethodChain = true;
				}

				const wrappedMethod = new VariableNode();
				wrappedMethod.name = reductionResult.accessor;
				wrappedMethod.isPartOfMethodChain = true;
				const args = this.makeArgGroup(argNodes);

				if (methodInvocation.startPosition != null) {
					methodInvocation.startPosition.offset -= reductionResult.accessorLen;
					methodInvocation.startPosition.char -= reductionResult.accessorLen;
				}

				methodInvocation.method = wrappedMethod;
				methodInvocation.args = args;

				if (StringUtilities.isNumeric(prevNode.name)) {
					const varNode = newTokens.pop() as VariableNode;
					newTokens.push(this.convertOperatorToVarNode(varNode));
				}

				newTokens.push(methodInvocation);
				continue;
			} else if (thisNode instanceof VariableNode && prevNode instanceof MethodInvocationNode) {
				this.cleanVariableForMethodInvocation(thisNode);

				if (i + 1 > nodeCount) {
					thisNode.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_METHOD_CALL_MISSING_ARG_GROUP,
						thisNode,
						'Unexpected end of input while parsing method call.'
					));
					continue;
				}

				const argGroupT = tokens[i + 1];

				if (argGroupT instanceof LogicGroup == false) {
					thisNode.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_INVALID_METHOD_CALL_ARG_GROUP,
						thisNode,
						'Unexpected [' + TypeLabeler.getPrettyTypeName(argGroupT) + '] while parsing [T_METHOD_CALL]; expecting [T_ARG_GROUP].'
					));
					continue;
				}

				const argGroup: LogicGroup = argGroupT as LogicGroup;

				let argNodes: AbstractNode[] = [];

				if (argGroup.nodes.length > 0) {
					if (argGroup.nodes[0] instanceof SemanticGroup) {
						const tSg = argGroup.nodes[0] as SemanticGroup;
						argNodes = tSg.nodes;
					} else {
						argNodes = argGroup.nodes;
					}
				}

				const methodInvocation = new MethodInvocationNode();
				methodInvocation.startPosition = thisNode.startPosition;
				methodInvocation.endPosition = argGroup.endPosition;
				methodInvocation.args = this.makeArgGroup(argNodes);
				methodInvocation.method = thisNode;
				prevNode.methodTarget = methodInvocation;

				newTokens.push(methodInvocation);

				i += 1;
				continue;
			} else if (thisNode instanceof InlineBranchSeparator && prevNode instanceof MethodInvocationNode) {
				if (i + 1 > nodeCount) {
					thisNode.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_METHOD_CALL_MISSING_METHOD,
						thisNode,
						'Unexpected end of input while parsing method call.'
					));
					continue;
				}

				const next = tokens[i + 1] as VariableNode;

				if (i + 2 > nodeCount) {
					thisNode.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_METHOD_CALL_MISSING_ARG_GROUP,
						thisNode,
						'Unexpected end of input while parsing method call.'
					));
					continue;
				}

				const argGroupT = tokens[i + 2];

				if (argGroupT instanceof LogicGroup == false) {
					thisNode.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_INVALID_METHOD_CALL_ARG_GROUP,
						thisNode,
						'Unexpected [' + TypeLabeler.getPrettyTypeName(argGroupT) + '] while parsing [T_METHOD_CALL]; expecting [T_ARG_GROUP].'
					));
					continue;
				}

				const argGroup: LogicGroup = argGroupT as LogicGroup;

				let argNodes: AbstractNode[] = [];

				if (argGroup.nodes.length > 0) {
					if (argGroup.nodes[0] instanceof SemanticGroup) {
						const tSg = argGroup.nodes[0] as SemanticGroup;
						argNodes = tSg.nodes;
					} else {
						argNodes = argGroup.nodes;
					}
				}

				const methodInvocation = new MethodInvocationNode();
				methodInvocation.startPosition = thisNode.startPosition;
				methodInvocation.endPosition = argGroupT.endPosition;
				methodInvocation.args = this.makeArgGroup(argNodes);
				methodInvocation.method = next;
				prevNode.methodTarget = methodInvocation;

				newTokens.push(methodInvocation);

				i += 2;
				continue;
			} else if (thisNode instanceof MethodInvocationNode) {
				if (i + 1 > nodeCount) {
					thisNode.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_METHOD_CALL_MISSING_METHOD,
						thisNode,
						'Unexpected end of input while parsing method call.'
					));
					continue;
				}

				const methodNode = tokens[i + 1] as VariableNode;

				if (i + 2 > nodeCount) {
					thisNode.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_INVALID_METHOD_CALL_ARG_GROUP,
						thisNode,
						'Unexpected end of input while parsing method call.'
					));
					continue;
				}

				const nextT = tokens[i + 2];

				if (nextT instanceof LogicGroup == false) {
					thisNode.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_INVALID_METHOD_CALL_ARG_GROUP,
						thisNode,
						'Unexpected [' + TypeLabeler.getPrettyTypeName(nextT) + '] while parsing [T_METHOD_CALL]; expecting [T_ARG_GROUP].'
					));
					continue;
				}

				const next: LogicGroup = nextT as LogicGroup;

				let argNodes: AbstractNode[] = [];

				if (next.nodes.length > 0) {
					if (next.nodes[0] instanceof SemanticGroup) {
						const tSg = next.nodes[0] as SemanticGroup;
						argNodes = tSg.nodes;
					} else {
						argNodes = next.nodes;
					}
				}

				const args = this.makeArgGroup(argNodes);

				if (prevNode instanceof VariableNode && LibraryManager.deferredCoreLibraries.includes(prevNode.name)) {
					const varRef = newTokens.pop() as VariableNode;

					const libraryInvocation = new LibraryInvocationConstruct();
					libraryInvocation.startPosition = varRef.startPosition;
					libraryInvocation.endPosition = next.endPosition;
					libraryInvocation.libraryName = varRef.name;
					libraryInvocation.methodName = methodNode.name;
					libraryInvocation.content = libraryInvocation.libraryName + '->' + libraryInvocation.methodName;
					libraryInvocation.arguments = args;
					prevNode.libraryTarget = libraryInvocation;

					newTokens.push(libraryInvocation);
					i += 2;
					continue;
				}

				thisNode.method = methodNode;
				thisNode.args = args;

				if (newTokens.length > 0) {
					newTokens[newTokens.length - 1].methodTarget = thisNode;
				}

				i += 2;
				newTokens.push(thisNode);
				continue;
			} else {
				newTokens.push(thisNode);
			}
		}

		return newTokens;
	}

	private convertVariableToStringNode(node: VariableNode) {
		const wrappedNode = new StringValueNode();
		wrappedNode.content = node.name;
		wrappedNode.value = node.name;
		wrappedNode.originalAbstractNode = node;
		wrappedNode.startPosition = node.startPosition;
		wrappedNode.endPosition = node.endPosition;
		wrappedNode.index = node.index;

		return wrappedNode;
	}

	private createTupleLists(tokens: AbstractNode[]) {
		const tokenCount = tokens.length,
			newTokens: AbstractNode[] = [];

		for (let i = 0; i < tokenCount; i++) {
			const thisToken = tokens[i];

			if (thisToken instanceof TupleListStart) {
				thisToken.isListGroupMember = true;

				if (i + 1 >= tokenCount) {
					thisToken.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_EOI_PARSING_TUPLE_LIST,
						thisToken,
						'Unexpected end of input while parsing tuple list.'
					));
					continue;
				}

				const peekT = tokens[i + 1];

				if (peekT instanceof LogicGroup == false) {
					peekT.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_TYPE_FOR_TUPLE_LIST,
						peekT,
						'Unexpected [' + TypeLabeler.getPrettyTypeName(peekT) + '] while parsing tuple list.'
					));
					continue;
				}

				const peek: LogicGroup = peekT as LogicGroup;

				this.markAllNonVirtualAsListGroupMember([peek]);

				this.retriggerNonVirtualGroupMembers.push([peek]);

				// Each value in the next T_LOGIC_GROUP
				// should be a semantic group instance.
				// The first semantic group will have
				// the tuple list's variable names.
				const listNodeLength = peek.nodes.length;

				if (listNodeLength == 0) {
					peek.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_MISSING_BODY_TUPLE_LIST,
						peek,
						'Missing tuple list body while parsing tuple list.'
					));
					continue;
				}

				const nameGroup = peek.nodes.shift() as SemanticGroup;
				const targetGroupLength = nameGroup.nodes.length;

				const listNames: StringValueNode[] = [];

				for (let j = 0; j < targetGroupLength; j++) {
					const subNodeT = nameGroup.nodes[j];

					if (subNodeT instanceof ArgSeparator == false) {
						let breakFromVarRef = false;

						if (subNodeT instanceof VariableNode) {
							if (subNodeT.variableReference == null) {
								breakFromVarRef = true;
							}

							if (subNodeT.variableReference != null) {
								if (subNodeT.variableReference.pathParts.length > 1) {
									breakFromVarRef = true;
								}
							}

							if (subNodeT.name.trim().length == 0) {
								breakFromVarRef = true;
							}
						}

						if (breakFromVarRef || subNodeT instanceof VariableNode == false) {
							peek.pushError(AntlersError.makeSyntaxError(
								AntlersErrorCodes.TYPE_INVALID_TUPLE_LIST_NAME_TYPE,
								peek,
								'Invalid [' + TypeLabeler.getPrettyTypeName(subNodeT) + '] name type found while parsing tuple list.'
							));
							continue;
						}

						const subNode: VariableNode = subNodeT as VariableNode;

						listNames.push(this.convertVariableToStringNode(subNode));
					}
				}

				const listValueLength = listNames.length;

				if (listValueLength == 0) {
					peek.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_INVALID_MANIFESTED_NAME_GROUP,
						peek,
						'Invalid Name expression produced an invalid name group while parsing tuple list.'
					));
					continue;
				}

				// We will simply convert the tuple list syntax into an array node under the hood.
				const arrayNode = new ArrayNode();
				this.createdArrays.push(arrayNode);
				arrayNode.startPosition = thisToken.startPosition;
				arrayNode.endPosition = thisToken.endPosition;

				peek.nodes.forEach((valueNodeCandidateT) => {
					if (valueNodeCandidateT instanceof SemanticGroup == false) {
						valueNodeCandidateT.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_INVALID_TUPLE_LIST_VALUE_TYPE_GROUP,
							valueNodeCandidateT,
							'Invalid [' + TypeLabeler.getPrettyTypeName(valueNodeCandidateT) + '] name type found while parsing tuple list value expression.'
						));
						return;
					}

					const valueNodeCandidate: SemanticGroup = valueNodeCandidateT as SemanticGroup;

					const nestedArrayNode = new ArrayNode();
					this.createdArrays.push(nestedArrayNode);
					nestedArrayNode.startPosition = valueNodeCandidate.startPosition;

					const valueCandidates: AbstractNode[] = [];

					for (let j = 0; j < targetGroupLength; j++) {
						const valueToken = valueNodeCandidate.nodes[j];

						if (valueToken instanceof ArgSeparator == false) {
							if (this.isOperand(valueToken) == false) {
								valueToken.pushError(AntlersError.makeSyntaxError(
									AntlersErrorCodes.TYPE_INVALID_TUPLE_LIST_VALUE_TYPE,
									valueToken,
									'Unexpected [' + TypeLabeler.getPrettyTypeName(valueToken) + ']  while parsing tuple list value.'
								));
								continue;
							}

							valueCandidates.push(valueToken);
						}
					}

					for (let j = 0; j < listValueLength; j++) {
						if (j > valueCandidates.length) {
							break;
						}

						const valueToken = valueCandidates[j];

						const namedValueNode = new NameValueNode();
						namedValueNode.startPosition = valueToken.startPosition;
						namedValueNode.endPosition = valueToken.endPosition;
						namedValueNode.name = listNames[j];
						namedValueNode.value = valueToken;

						nestedArrayNode.nodes.push(namedValueNode);
						arrayNode.endPosition = valueToken.endPosition;
						nestedArrayNode.endPosition = valueToken.endPosition;
					}

					arrayNode.nodes.push(nestedArrayNode);
				});

				newTokens.push(arrayNode);
				i += 1;
				continue;
			} else {
				newTokens.push(thisToken);
			}
		}

		return tokens;
	}

	private makeOrderGroup(nodes: AbstractNode[]) {
		const orders: ValueDirectionNode[] = [],
			nodeCount = nodes.length;
		let orderCount = 0;

		for (let i = 0; i < nodeCount; i++) {
			const thisNode = nodes[i];

			let next: AbstractNode | null = null;

			if (i + 1 < nodeCount) {
				next = nodes[i + 1];
			}

			if (i > 0) {
				if (next == null || next instanceof ArgSeparator) {
					orderCount += 1;
					const orderNode = new ValueDirectionNode();
					orderNode.order = orderCount;
					orderNode.name = nodes[i - 1];
					orderNode.directionNode = thisNode;

					if (this.isOperand(orderNode.name) == false) {
						orderNode.name.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_INVALID_ORDER_BY_NAME_VALUE,
							orderNode.name,
							'Invalid value or expression supplied for order by name.'
						));
					}

					if (this.isOperand(orderNode.directionNode) == false) {
						orderNode.directionNode.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_INVALID_ORDER_BY_SORT_VALUE,
							orderNode.directionNode,
							'Invalid value or expression supplied for order by direction.'
						));
					}

					orderNode.startPosition = orderNode.name.startPosition;
					orderNode.endPosition = orderNode.directionNode.endPosition;

					orders.push(orderNode);
					i += 1;
					continue;
				}
			}
		}

		return orders;
	}

	private getValues(nodes: AbstractNode[]) {
		const valueNode = new ListValueNode(),
			nodeCount = nodes.length,
			values: AbstractNode[] = [];

		for (let i = 0; i < nodeCount; i++) {
			const thisNode = nodes[i];

			let next: AbstractNode | null = null;

			if (i + 1 < nodeCount) {
				next = nodes[i + 1];
			}

			if (next == null || next instanceof ArgSeparator) {
				values.push(thisNode);
				i += 1;
				continue;
			}
		}

		valueNode.values = values;

		return valueNode;
	}

	private createLibraryInvocations(tokens: AbstractNode[]) {
		const newTokens: AbstractNode[] = [],
			tokenCount = tokens.length;

		for (let i = 0; i < tokenCount; i++) {
			const token = tokens[i];

			if (token instanceof LanguageOperatorConstruct) {
				if (token.content.includes('.')) {
					const content: string[] = token.content.split('.'),
						libraryName = content.shift() as string,
						methodName = content.join('.');

					const libraryInvocationConstruct = new LibraryInvocationConstruct();
					libraryInvocationConstruct.startPosition = token.startPosition;
					libraryInvocationConstruct.endPosition = token.endPosition;
					libraryInvocationConstruct.content = token.content;
					libraryInvocationConstruct.libraryName = libraryName;
					libraryInvocationConstruct.methodName = methodName;
					libraryInvocationConstruct.originalAbstractNode = token;

					if (i + 1 >= tokenCount) {
						token.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_PARSING_ARG_GROUP,
							token,
							'Unexpected end of input while parsing argument group.'
						));
						continue;
					}

					if (tokens[i + 1] instanceof LogicGroup == false) {
						token.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_EXPECTING_ARGUMENT_GROUP,
							token,
							'Unexpected token while parsing method call. Expecting [T_ARG_SEPARATOR] got [' + TypeLabeler.getPrettyTypeName(token) + '].'
						));
						continue;
					}

					const logicGroup: LogicGroup = tokens[i + 1] as LogicGroup;
					let argGroup: ArgumentGroup | null = null;

					if (logicGroup.nodes.length > 0) {
						const semanticGroup = logicGroup.nodes[0] as SemanticGroup;

						argGroup = this.makeArgGroup(semanticGroup.nodes);
					}

					if (argGroup == null) {
						// Wrap everything in an empty argument group.
						argGroup = new ArgumentGroup();
						argGroup.startPosition = logicGroup.startPosition;
						argGroup.endPosition = logicGroup.endPosition;
						argGroup.originalAbstractNode = logicGroup;
					}

					libraryInvocationConstruct.arguments = argGroup;
					newTokens.push(libraryInvocationConstruct);
					i += 1;
					continue;
				} else if (token.content == LanguageOperatorRegistry.ARR_ORDERBY) {
					if (i + 1 >= tokenCount) {
						token.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_UNEXPECTED_EOI_PARSING_ORDER_GROUP,
							token,
							'Unexpected end of input while parsing order group.'
						));
						continue;
					}

					const nextTokenT = tokens[i + 1];

					if (nextTokenT instanceof LogicGroup == false) {
						nextTokenT.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_EXPECTING_ORDER_GROUP_FOR_ORDER_BY_OPERAND,
							nextTokenT,
							'Unexpected [' + TypeLabeler.getPrettyTypeName(nextTokenT) + '] while parsing order group.'
						));
						continue;
					}

					const nextToken: LogicGroup = nextTokenT as LogicGroup;

					let subNodes = nextToken.nodes;

					if (subNodes[0] instanceof SemanticGroup) {
						const tSg = subNodes[0] as SemanticGroup;
						subNodes = tSg.nodes;
					}

					const orderClauses = this.makeOrderGroup(subNodes);

					if (orderClauses.length == 0) {
						token.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_UNEXPECTED_EMPTY_DIRECTION_GROUP,
							token,
							'Unexpected empty [T_DIRECTION_GROUP]. Must have at least one order clause, and each property must have a direction specified.'
						));
					}

					const orderGroup = new DirectionGroup();
					orderGroup.orderClauses = orderClauses;

					if (orderClauses.length > 0) {
						if (orderClauses[0].directionNode != null) {
							orderGroup.startPosition = orderClauses[0].directionNode.startPosition;
						}

						const ocLastDn: AbstractNode | null = orderClauses[orderClauses.length - 1].directionNode;

						if (ocLastDn != null) {
							orderGroup.endPosition = ocLastDn.endPosition;
						}
					}

					newTokens.push(token);
					newTokens.push(orderGroup);
					i += 1;
					continue;
				} else if (token.content == LanguageOperatorRegistry.ARR_GROUPBY) {
					if (i + 1 >= tokenCount) {
						token.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_PARSING_GROUP_BY,
							token,
							'Unexpected end of input while parsing group by clause.'
						));
						continue;
					}

					const nextTokenT = tokens[i + 1];

					if (nextTokenT instanceof AliasedScopeLogicGroup || nextTokenT instanceof ScopedLogicGroup) {
						nextTokenT.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_GROUP_BY_SCOPED_GROUP_MUST_BE_ENCLOSED,
							nextTokenT,
							'Type [' + TypeLabeler.getPrettyTypeName(nextTokenT) + '] must be enclosed with parenthesis to be used with groupby.'
						));
						continue;
					}

					if (nextTokenT instanceof LogicGroup == false) {
						nextTokenT.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_UNEXPECTED_TOKEN_FOR_GROUP_BY,
							nextTokenT,
							'Unexpected [' + TypeLabeler.getPrettyTypeName(nextTokenT) + '] while parsing group by.'
						));
						continue;
					}

					const nextToken: LogicGroup = nextTokenT as LogicGroup;
					let subNodes = nextToken.nodes;

					if (subNodes[0] instanceof SemanticGroup) {
						const tSg = subNodes[0] as SemanticGroup;
						subNodes = tSg.nodes;
					}

					const listValues = this.getValues(subNodes);

					newTokens.push(token);
					newTokens.push(listValues);

					if (i + 2 < tokenCount && i + 3 < tokenCount) {
						const peekOne: AbstractNode = tokens[i + 2],
							peekTwo: AbstractNode = tokens[i + 3];

						if (NodeHelpers.isVariableMatching(peekOne, LanguageKeywords.ScopeAs)) {
							if (peekTwo instanceof StringValueNode) {
								listValues.isNamedNode = true;
								listValues.parsedName = peekTwo;

								i += 3;
								continue;
							} else {
								peekTwo.pushError(AntlersError.makeSyntaxError(
									AntlersErrorCodes.TYPE_UNEXPECTED_GROUP_BY_AS_ALIAS_TYPE,
									peekTwo,
									'Expecting [T_STRING] for group by collection alias; got [' + TypeLabeler.getPrettyTypeName(peekTwo) + '].'
								));
							}
						}
					}

					i += 1;
					continue;
				} else if (token.content == LanguageOperatorRegistry.STRUCT_SWITCH) {
					if (i + 1 >= tokenCount) {
						token.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_PARSING_SWITCH_GROUP,
							token,
							'Unexpected end of input while parsing [T_SWITCH_GROUP].'
						));
						continue;
					}

					const nextT = tokens[i + 1];

					if (nextT instanceof ScopedLogicGroup == false) {
						nextT.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_UNEXPECTED_TOKEN_FOR_SWITCH_GROUP,
							nextT,
							'Unexpected [' + TypeLabeler.getPrettyTypeName(nextT) + '] while parsing [T_SWITCH_GROUP].'
						));
						continue;
					}

					const next: ScopedLogicGroup = nextT as ScopedLogicGroup;

					this.markAllNonVirtualAsSwitch([nextT]);
					if (next.scope == null || next.scope instanceof LogicGroup == false) {
						next.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_UNEXPECTED_SWITCH_START_VALUE,
							next,
							'Unexpected input while parsing [T_SWITCH_GROUP].'
						));
						continue;
					}

					const tSwitchScope = next.scope as any as LogicGroup;

					if (tSwitchScope.nodes.length == 0 || tSwitchScope.nodes[0] instanceof SemanticGroup == false) {
						next.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_UNEXPECTED_SWITCH_START_VALUE_NO_VALUE,
							next,
							'Unexpected input while parsing [T_SWITCH_GROUP].'
						));
						continue;
					}

					const wrapperSemanticGroup: SemanticGroup = tSwitchScope.nodes[0] as SemanticGroup;
					this.markAllNonVirtualAsSwitch([tSwitchScope]);
					if (wrapperSemanticGroup.nodes.length == 0 || wrapperSemanticGroup.nodes[0] instanceof LogicGroup == false) {
						token.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_UNEXPECTED_SWITCH_START_VALUE_NO_VALUE,
							token,
							'Unexpected input while parsing [T_SWITCH_GROUP].'
						));
						continue;
					}

					this.markAllNonVirtualAsSwitch([token]);
					this.markAllNonVirtualAsSwitch(wrapperSemanticGroup.nodes);
					const firstCondition = wrapperSemanticGroup.nodes;

					if (next.nodes.length == 0) {
						token.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_UNEXPECTED_SWITCH_START_VALUE_NO_VALUE,
							token,
							'Unexpected input while parsing [T_SWITCH_GROUP].'
						));
					}

					const expressionNodeT = tSwitchScope.nodes[0];

					if (expressionNodeT instanceof SemanticGroup == false) {
						token.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_UNEXPECTED_SWITCH_START_VALUE_NO_VALUE,
							token,
							'Unexpected input while parsing [T_SWITCH_GROUP].'
						));
						continue;
					}

					const expressionNode: SemanticGroup = tSwitchScope.nodes[0] as SemanticGroup;

					this.markAllNonVirtualAsSwitch(expressionNode.nodes);

					const subTokens = expressionNode.nodes;

					const switchGroup = new SwitchGroup();

					const wrapperGroup = new LogicGroup();
					wrapperGroup.nodes = firstCondition;
					wrapperGroup.startPosition = wrapperGroup.nodes[0].startPosition;
					wrapperGroup.endPosition = wrapperGroup.nodes[wrapperGroup.nodes.length - 1].endPosition;


					const firstCase = new SwitchCase();
					firstCase.condition = wrapperGroup;

					const expWrapper = new LogicGroup();
					expWrapper.nodes.push(subTokens.shift() as AbstractNode);
					expWrapper.startPosition = expWrapper.nodes[0].startPosition;
					expWrapper.endPosition = expWrapper.nodes[expWrapper.nodes.length - 1].endPosition;

					firstCase.expression = expWrapper;

					firstCase.startPosition = firstCase.condition.startPosition;
					firstCase.endPosition = firstCase.expression.nodes[firstCase.expression.nodes.length - 1].endPosition;

					subTokens.shift();

					switchGroup.cases.push(firstCase);
					const subTokenCount = subTokens.length;

					if (subTokenCount > 0) {
						if (subTokens[0] instanceof LogicGroup == false) {
							token.pushError(AntlersError.makeSyntaxError(
								AntlersErrorCodes.TYPE_PARSER_INVALID_SWITCH_TOKEN,
								token,
								'Invalid [' + TypeLabeler.getPrettyTypeName(subTokens[0]) + '] while parsing case statement.'
							));
							continue;
						}

						for (let c = 0; c < subTokenCount; c++) {
							const thisToken = subTokens[c];
							let next: AbstractNode | null = null;

							if (thisToken instanceof ArgSeparator) {
								thisToken.isSwitchGroupMember = true;
								continue;
							}

							if (c + 1 < subTokenCount) {
								next = subTokens[c + 1];
							}

							if (next instanceof ScopeAssignmentOperator) {
								next.isSwitchGroupMember = true;

								const newCase = new SwitchCase();
								newCase.condition = thisToken as any as LogicGroup;
								this.markAllNonVirtualAsSwitch([newCase.condition]);
								const expWrapper = new LogicGroup();
								expWrapper.nodes.push(subTokens[c + 2]);
								expWrapper.startPosition = expWrapper.nodes[0].startPosition;
								expWrapper.endPosition = expWrapper.nodes[expWrapper.nodes.length - 1].endPosition;

								newCase.expression = expWrapper;

								this.markAllNonVirtualAsSwitch([expWrapper]);

								newCase.startPosition = newCase.condition.startPosition;
								newCase.endPosition = newCase.expression.nodes[newCase.expression.nodes.length - 1].endPosition;

								switchGroup.cases.push(newCase);

								if (c + 3 < subTokenCount) {
									if (subTokens[c + 3] instanceof ArgSeparator == false) {
										subTokens[c + 3].pushError(AntlersError.makeSyntaxError(
											AntlersErrorCodes.TYPE_PARSER_INVALID_SWITCH_TOKEN,
											subTokens[c + 3],
											'Invalid [' + TypeLabeler.getPrettyTypeName(subTokens[c + 3]) + '] while parsing case statement; expecting [T_ARG_SEPARATOR].'
										));
										continue;
									}
								}

								subTokens[c + 3].isSwitchGroupMember = true;

								c += 2;
								continue;
							}
						}
					}

					newTokens.push(new NullConstant());
					newTokens.push(token);
					newTokens.push(switchGroup);
					i += 1;
					continue;
				} else if (token.content == LanguageOperatorRegistry.ARR_MAKE) {
					if (i + 1 >= tokenCount) {
						token.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_ARR_MAKE_MISSING_TARGET,
							token,
							'Missing target variable for arr operator.'
						));
						continue;
					}

					const nextTokenT = tokens[i + 1];

					if (nextTokenT instanceof LogicGroup == false) {
						nextTokenT.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_ARR_MAKE_UNEXPECTED_TYPE,
							nextTokenT,
							'Unexpected [' + TypeLabeler.getPrettyTypeName(nextTokenT) + '] while parsing array.'
						));
						continue;
					}

					const isNextScopedLogicGroup = nextTokenT instanceof ScopedLogicGroup;
					const nextToken: LogicGroup = nextTokenT as LogicGroup;

					let subNodes = nextToken.nodes;

					if (subNodes[0] instanceof SemanticGroup) {
						const tSg = subNodes[0] as SemanticGroup;
						subNodes = tSg.nodes;
					}

					if (isNextScopedLogicGroup) {
						const nextTScoped = nextTokenT as ScopedLogicGroup;
						subNodes.unshift(new ScopeAssignmentOperator());
						subNodes.unshift(nextTScoped.scope as AbstractNode);
					}

					const values = this.getArrayValues(subNodes);
					const arrayNode = new ArrayNode();
					arrayNode.startPosition = token.startPosition;

					const valueNodeCount = values.values.length;

					if (valueNodeCount > 0) {
						arrayNode.endPosition = values.values[valueNodeCount - 1].endPosition;
					} else {
						arrayNode.endPosition = token.endPosition;
					}

					if (nextToken.end != null) {
						arrayNode.endPosition = nextToken.end.endPosition;
					}

					arrayNode.nodes = values.values as NameValueNode[];

					this.createdArrays.push(arrayNode);

					newTokens.push(arrayNode);

					i += 1;
				} else {
					newTokens.push(token);
				}
			} else {
				newTokens.push(token);
			}
		}

		return newTokens;
	}

	private getArrayValues(nodes: AbstractNode[]) {
		const valueNode = new ListValueNode(),
			nodeCount = nodes.length,
			values: NameValueNode[] = [];

		for (let i = 0; i < nodeCount; i++) {
			const thisNode = nodes[i];

			if (thisNode instanceof ArgSeparator) {
				thisNode.pushError(AntlersError.makeSyntaxError(
					AntlersErrorCodes.TYPE_ARR_UNEXPECT_ARG_SEPARATOR,
					thisNode,
					'Unexpected [T_ARG_SEPARATOR] while parsing array.'
				));
				continue;
			}

			if (thisNode instanceof ScopeAssignmentOperator) {
				if (i == 0) {
					thisNode.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_ARR_KEY_PAIR_MISSING_KEY,
						thisNode,
						'Missing key for key/value pair while parsing array.'
					));
					continue;
				} else {
					if (nodes[i - 1] instanceof ArgSeparator) {
						thisNode.pushError(AntlersError.makeSyntaxError(
							AntlersErrorCodes.TYPE_ARR_KEY_PAIR_MISSING_KEY,
							thisNode,
							'Missing key for key/value pair while parsing array.'
						));
						continue;
					}
				}
			}

			let next: AbstractNode | null = null;

			if (i + 1 < nodeCount) {
				next = nodes[i + 1];
			}

			if (next instanceof ScopeAssignmentOperator) {
				if (i + 2 >= nodeCount) {
					next.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_ARR_MAKE_MISSING_ARR_KEY_PAIR_VALUE,
						next,
						'Missing key/pair value while parsing array.'
					));
					continue;
				}

				const keyValue = nodes[i + 2];
				const namedValueNode = new NameValueNode();

				if (this.isValidArrayKeyNode(thisNode) == false) {
					thisNode.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_ARR_KEY_PAIR_INVALID_KEY_TYPE,
						thisNode,
						'Invalid [' + TypeLabeler.getPrettyTypeName(thisNode) + '] type for key/value key.'
					));
					continue;
				}

				namedValueNode.name = thisNode;
				namedValueNode.value = keyValue;
				namedValueNode.startPosition = thisNode.startPosition;
				namedValueNode.endPosition = keyValue.endPosition;

				values.push(namedValueNode);
				i += 3;
				continue;
			}

			if (next == null || next instanceof ArgSeparator) {
				const namedValueNode = new NameValueNode();
				namedValueNode.value = thisNode;
				namedValueNode.startPosition = thisNode.startPosition;
				namedValueNode.endPosition = thisNode.endPosition;

				values.push(namedValueNode);

				i += 1;
				continue;
			}
		}

		valueNode.values = values;

		return valueNode;
	}

	private isValidArrayKeyNode(node: AbstractNode) {
		if (node instanceof NumberNode || node instanceof StringValueNode) {
			return true;
		}

		return false;
	}

	private associateModifiers(tokens: AbstractNode[]) {
		const newNodes: AbstractNode[] = [],
			tokenCount = tokens.length;
		let applyModifiersToNode: AbstractNode | null = null;

		for (let i = 0; i < tokenCount; i++) {
			const node = tokens[i];

			if (node instanceof ModifierSeparator) {
				const newNodeCount = newNodes.length;

				if (newNodeCount == 0) {
					node.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_MODIFIER_SEPARATOR,
						node,
						'Unexpected [T_MODIFIER_SEPARATOR] while parsing input text.'
					));
					continue;
				}

				this.isRealModifierSeparator.set(node, true);

				applyModifiersToNode = newNodes[newNodeCount - 1];

				if (applyModifiersToNode.modifierChain == null) {
					applyModifiersToNode.modifierChain = new ModifierChainNode();
					applyModifiersToNode.modifierChain.modifierTarget = applyModifiersToNode;
					this.createdModifierChains.push(applyModifiersToNode.modifierChain);
				}

				if (i + 1 >= tokenCount) {
					node.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_PARSING_MODIFIER_DETAILS,
						node,
						'Unexpected end of input while preparing to gather modifier details.'
					));
					continue;
				}

				const results = this.scanToEndOfModifier(tokens.slice(i + 1));

				const resultCount = results.length;

				if (resultCount > 1) {
					if (results[1] instanceof InlineBranchSeparator) {
						this.isRealModifierSeparator.set(results[1], true);
						const firstToken = results[0];

						if (firstToken instanceof AdditionOperator) {
							results[0] = this.wrapArithmeticModifier(firstToken, 'add');
						} else if (firstToken instanceof SubtractionOperator) {
							results[0] = this.wrapArithmeticModifier(firstToken, 'subtract');
						} else if (firstToken instanceof DivisionOperator) {
							results[0] = this.wrapArithmeticModifier(firstToken, 'divide');
						} else if (firstToken instanceof MultiplicationOperator) {
							results[0] = this.wrapArithmeticModifier(firstToken, 'multiply');
						} else if (firstToken instanceof ModulusOperator) {
							results[0] = this.wrapArithmeticModifier(firstToken, 'mod');
						}
					}
				}

				if (resultCount == 0) {
					node.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNSET_MODIFIER_DETAILS,
						node,
						'Invalid or missing modifier details.'
					));
					continue;
				}

				if (results[0] instanceof ModifierNameNode == false) {
					node.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_MODIFIER_NAME_NOT_START_OF_DETAILS,
						node,
						'Invalid [' + TypeLabeler.getPrettyTypeName(results[0]) + ']; expecting [T_MODIFIER_NAME]'
					));
					continue;
				}

				const modifier = this.createModifier(results) as ModifierNode;

				if (modifier.nameNode != null) {
					this.modifierNameMapping.set(modifier.nameNode, modifier);
				}

				i += resultCount;

				applyModifiersToNode.modifierChain.modifierChain.push(modifier);
				applyModifiersToNode.modifierChain.updateValues();
				continue;
			} else {
				newNodes.push(node);
			}
		}

		return newNodes;
	}

	private createNullCoalescenceGroups(tokens: AbstractNode[]) {
		const newTokens: AbstractNode[] = [],
			tokenCount = tokens.length;

		for (let i = 0; i < tokenCount; i++) {
			const node = tokens[i];

			if (node instanceof NullCoalesceOperator) {
				const left = newTokens.pop() as AbstractNode;

				if (i + 1 >= tokenCount) {
					node.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_PARSING_NULL_COALESCENCE_GROUP,
						node,
						'Unexpected end of input while parsing input text.'
					));
					continue;
				}

				const right = tokens[i + 1];
				const nullCoalescenceGroup = new NullCoalescenceGroup();
				nullCoalescenceGroup.left = left;
				nullCoalescenceGroup.right = right;
				newTokens.push(nullCoalescenceGroup);

				i += 1;
				continue;
			} else {
				newTokens.push(node);
			}
		}

		return newTokens;
	}

	private isOperand(token: AbstractNode) {
		return token instanceof VariableNode || token instanceof LogicGroup ||
			token instanceof StringValueNode || token instanceof NumberNode ||
			token instanceof FalseConstant || token instanceof NullConstant ||
			token instanceof TrueConstant || token instanceof LibraryInvocationConstruct ||
			token instanceof DirectionGroup || token instanceof ListValueNode ||
			token instanceof SwitchGroup || token instanceof ArrayNode;
	}

	private isProperMethodChainTargetStrict(token: AbstractNode) {
		return token instanceof LogicGroup ||
			token instanceof StringValueNode || token instanceof NumberNode ||
			token instanceof FalseConstant || token instanceof NullConstant ||
			token instanceof TrueConstant || token instanceof LibraryInvocationConstruct ||
			token instanceof DirectionGroup || token instanceof ListValueNode ||
			token instanceof SwitchGroup || token instanceof ArrayNode;
	}

	private assertOperandRight(tokens: AbstractNode[], i: number) {
		if (i + 1 > tokens.length - 1) {
			tokens[i].pushError(AntlersError.makeSyntaxError(
				AntlersErrorCodes.TYPE_UNEXPECTED_END_OF_INPUT,
				tokens[i],
				'Unexpected end of input; expecting operand for operator ' + TypeLabeler.getPrettyTypeName(tokens[i]) + ' near "' + LineRetriever.getNearText(tokens[i]) + '".'
			));
			return false;
		}

		const token = tokens[i + 1];

		if (!this.isOperand(token)) {
			token.pushError(AntlersError.makeSyntaxError(
				AntlersErrorCodes.TYPE_EXPECTING_OPERAND,
				tokens[i],
				'Expecting operand, found ' + TypeLabeler.getPrettyTypeName(token) + ' near "' + LineRetriever.getNearText(tokens[i]) + '".'
			));
			return false;
		}

		return true;
	}

	private resolveValueRight(nodes: AbstractNode[], index: number): RightValueResult {
		let value: AbstractNode | null = null,
			negationCount = 0,
			lastNegation: AbstractNode | null = null;

		if (nodes.length > 0) {
			let doContinue = true;
			while (doContinue) {
				const curNode = nodes[index];

				if (curNode instanceof LogicalNegationOperator) {
					lastNegation = curNode;
					negationCount += 1;
					index += 1;
					doContinue = false;
					continue;
				} else if (this.isOperand(curNode)) {
					value = curNode;
					doContinue = false;
					break;
				} else {
					doContinue = false;
					break;
				}
			}
		}

		if (negationCount % 2 != 0) {
			const logicGroup = new LogicGroup();
			logicGroup.nodes = [];

			if (lastNegation != null && value != null) {
				logicGroup.nodes.push(lastNegation);
				logicGroup.nodes.push(value);
			}

			return {
				value: logicGroup,
				negationCount
			};
		}

		return {
			value: value,
			negationCount: negationCount
		};
	}

	private correctTypes(tokens: AbstractNode[]) {
		const newNodes: AbstractNode[] = [];

		tokens.forEach((node) => {
			if (node instanceof ModifierValueSeparator) {
				const branchSeparator = new InlineBranchSeparator();
				branchSeparator.startPosition = node.startPosition;
				branchSeparator.endPosition = node.endPosition;
				branchSeparator.originalAbstractNode = node;
				newNodes.push(branchSeparator);
			} else if (node instanceof ModifierValueNode) {
				const varNode = new VariableNode();
				varNode.name = node.value;
				varNode.startPosition = node.startPosition;
				varNode.endPosition = node.endPosition;
				varNode.modifierChain = node.modifierChain;
				varNode.originalAbstractNode = node;
				newNodes.push(varNode);
			} else {
				newNodes.push(node);
			}
		});

		return newNodes;
	}

	private createTernaryGroups(tokens: AbstractNode[]) {
		let newTokens: AbstractNode[] = [];
		const tokenCount = tokens.length;

		for (let i = 0; i < tokenCount; i++) {
			const node = tokens[i];

			if (node instanceof InlineTernarySeparator) {
				const separator = this.seek(InlineBranchSeparator, i + 1);

				if (separator.found == false) {
					node.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_TERNARY_EXPECTING_BRANCH_SEPARATOR,
						node,
						'Unexpected end of input; expecting [T_BRANCH_SEPARATOR].'
					));
					continue;
				}

				const result = this.collectUntil(newTokens);
				newTokens = result.tokens;
				const condition = result.collectedTokens[0];

				// const targetTokenIndex = (separator.foundAt ?? 0) - i  -1;
				const targetTokenIndex = (separator.foundAt ?? 0);

				if (targetTokenIndex >= tokenCount) {
					node.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_PARSING_TERNARY_GROUP,
						node,
						'Unexpected end of input while parsing ternary group.'
					));
					continue;
				}

				const truthBranch = tokens.slice(i + 1, targetTokenIndex);

				if (truthBranch.length > 1 || truthBranch.length == 0) {
					node.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_TERNARY_UNEXPECTED_EXPRESSION_LENGTH,
						node,
						'Unexpected number of operations within ternary truth branch.'
					));
					continue;
				}

				const truthBranchNodes = truthBranch[0];
				const falseBranchStart = (separator.foundAt ?? 0) + 1;

				if (falseBranchStart >= tokenCount) {
					node.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_PARSING_TERNARY_GROUP_FALSE_BRANCH,
						node,
						'Unexpected end of input while parsing ternary false execution branch.'
					));
					continue;
				}

				const falseBranch = tokens[falseBranchStart];

				const ternaryStructure = new TernaryCondition();
				ternaryStructure.head = condition;
				ternaryStructure.truthBranch = truthBranchNodes;
				ternaryStructure.falseBranch = falseBranch;

				newTokens.push(ternaryStructure);
				const targetJumpIndex = (separator.foundAt ?? 0) + 1;

				i = targetJumpIndex;
				continue;
			} else {
				newTokens.push(node);
			}
		}

		return newTokens;
	}

	private groupNodesByType(nodes: AbstractNode[], type: any) {
		const newNodes: AbstractNode[] = [],
			nodeCount = nodes.length;

		for (let i = 0; i < nodeCount; i++) {
			const node = nodes[i];

			if (i > 0 && node instanceof type) {
				const left: AbstractNode[] = [];
				const poppedLeft = newNodes.pop() as AbstractNode;

				left.push(poppedLeft);

				if (!this.assertOperandRight(nodes, i)) {
					continue;
				}

				if (i + 1 >= nodeCount) {
					node.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_REDUCING_NEGATION_OPERATORS,
						node,
						'Unexpected end of input while parsing input text.'
					));
					continue;
				}

				const right = nodes[i + 1];

				right.isVirtualGroupMember = true;
				poppedLeft.isVirtualGroupMember = true;
				node.isVirtualGroupMember = true;


				const logicGroup = new LogicGroup();
				logicGroup.nodes = left;
				logicGroup.nodes.push(node);
				logicGroup.nodes.push(right);

				i += 1;
				newNodes.push(logicGroup);
				continue;
			} else {
				newNodes.push(node);
			}
		}

		return newNodes;
	}

	private flagNodeAsOperatorResolve(node: AbstractNode) {
		if (node instanceof LogicGroup) {
			if (node.nodes.length == 0) { return; }

			this.flagNodeAsOperatorResolve(node.nodes[node.nodes.length - 1]);
		}

		node.isVirtualGroupOperatorResolve = true;

		if (node.next instanceof StatementSeparatorNode == false) {
			node.producesVirtualStatementTerminator = true;
		}
	}

	private groupNodesByOperatorType(nodes: AbstractNode[]) {
		const newNodes: AbstractNode[] = [],
			nodeCount = nodes.length;

		for (let i = 0; i < nodeCount; i++) {
			const node = nodes[i];

			if (i > 0 && LanguageParser.isOperatorType(node)) {
				const left: AbstractNode[] = [];
				const poppedLeft = newNodes.pop() as AbstractNode;

				left.push(poppedLeft);

				if (!this.assertOperandRight(nodes, i)) {
					continue;
				}

				if (i + 1 >= nodeCount) {
					node.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_REDUCING_NEGATION_OPERATORS,
						node,
						'Unexpected end of input while parsing input text.'
					));
					continue;
				}

				const right = nodes[i + 1];

				this.flagNodeAsOperatorResolve(right);

				poppedLeft.isVirtualGroupMember = true;
				right.isVirtualGroupMember = true;
				node.isVirtualGroupMember = true;

				const logicGroup = new LogicGroup();
				logicGroup.nodes = left;
				logicGroup.nodes.push(node);
				logicGroup.nodes.push(right);

				i += 1;
				newNodes.push(logicGroup);
				continue;
			} else {
				newNodes.push(node);
			}
		}

		return newNodes;
	}

	private applyOperationOrder(nodes: AbstractNode[]) {
		nodes = this.groupNodesByType(nodes, ExponentiationOperator);
		nodes = this.groupNodesByType(nodes, MultiplicationOperator);
		nodes = this.groupNodesByType(nodes, DivisionOperator);
		nodes = this.groupNodesByType(nodes, AdditionOperator);
		nodes = this.groupNodesByType(nodes, SubtractionOperator);

		return nodes;
	}

	private createLogicGroupsToRemoveMethodInvocationAmbiguity(nodes: AbstractNode[]) {
		const newNodes: AbstractNode[] = [],
			nodeLen = nodes.length,
			lastNodeIndex = nodeLen - 1;

		for (let i = 0; i < nodeLen; i++) {
			const thisNode = nodes[i];

			if (thisNode instanceof MethodInvocationNode) {
				const lastNode = newNodes.pop() as AbstractNode;

				const wrapperGroup = new LogicGroup();
				wrapperGroup.startPosition = lastNode.startPosition;

				lastNode.isVirtualGroupMember = true;
				thisNode.isVirtualGroupMember = true;

				wrapperGroup.nodes.push(lastNode);
				wrapperGroup.nodes.push(thisNode);

				if (i != lastNodeIndex) {
					for (let j = i + 1; j < nodeLen; j++) {
						if (nodes[j] instanceof MethodInvocationNode) {
							nodes[j].isVirtualGroupMember = true;
							wrapperGroup.nodes.push(nodes[j]);

							if (j == lastNodeIndex) {
								j += 1;
								break;
							}
						} else {
							if (j == lastNodeIndex) {
								j += 1;
								break;
							}

							i = j - 1;
							break;
						}
					}
				}

				wrapperGroup.endPosition = wrapperGroup.nodes[wrapperGroup.nodes.length - 1].endPosition;
				newNodes.push(wrapperGroup);
			} else {
				newNodes.push(thisNode);
			}
		}

		return newNodes;
	}

	private countTypeRight(tokens: AbstractNode[], start: number, type: any) {
		let count = 0;

		for (let i = start; i < tokens.length; i++) {
			if (tokens[i] instanceof type) {
				count += 1;
			} else {
				break;
			}
		}

		return count;
	}

	private createLogicGroupsToResolveOperatorAmbiguity(nodes: AbstractNode[]) {
		nodes = this.groupNodesByType(nodes, GreaterThanEqualCompOperator);
		nodes = this.groupNodesByType(nodes, GreaterThanCompOperator);

		nodes = this.groupNodesByType(nodes, LessThanEqualCompOperator);
		nodes = this.groupNodesByType(nodes, LessThanCompOperator);

		nodes = this.groupNodesByType(nodes, StrictEqualCompOperator);
		nodes = this.groupNodesByType(nodes, EqualCompOperator);

		nodes = this.groupNodesByType(nodes, NotStrictEqualCompOperator);
		nodes = this.groupNodesByType(nodes, NotEqualCompOperator);

		nodes = this.groupNodesByType(nodes, SpaceshipCompOperator);
		nodes = this.groupNodesByOperatorType(nodes);

		return nodes;
	}

	private createModifier(tokens: AbstractNode[]) {
		const modifierName = tokens.shift() as ModifierNameNode,
			values: AbstractNode[] = [],
			tokenCount = tokens.length;

		if (tokens.length > 0 && tokens[0] instanceof LogicGroup) {
			const unwrapped = this.unpack(tokens[0].nodes),
				tArgGroup = this.makeArgGroup(unwrapped);

			const modifier = new ModifierNode();
			modifier.nameNode = modifierName;
			modifier.methodStyleArguments = tArgGroup;

			if (tokens.length > 1) {
				for (let i = 1; i < tokenCount; i++) {
					tokens[i].pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_MODIFIER_UNEXPECTED_TOKEN_METHOD_SYNTAX,
						tokens[i],
						'Unexpected [' + TypeLabeler.getPrettyTypeName(tokens[i]) + '] while parsing modifier argument group. Expecting [T_MODIFIER_SEPARATOR] or end of current expression.'
					));
				}
			}

			return modifier;
		}

		for (let i = 0; i < tokenCount; i++) {
			if (tokens[i] instanceof ModifierValueSeparator || tokens[i] instanceof InlineBranchSeparator) {
				if (i + 1 >= tokenCount) {
					tokens[i].pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_MODIFIER_UNEXPECTED_END_OF_VALUE_LIST,
						tokens[i],
						'Unexpected end of modifier value list while parsing modifier.'
					));
					return tokens;
				}

				const next = tokens[i + 1];

				if (this.isValidModifierValue(next)) {
					if (next instanceof VariableNode) {
						if (next.variableReference != null && next.variableReference.pathParts.length > 0) {
							next.variableReference.pathParts.forEach((combinedPart) => {
								if (combinedPart instanceof PathNode) {
									const modifierValue = new ModifierValueNode();
									modifierValue.startPosition = combinedPart.startPosition;
									modifierValue.endPosition = combinedPart.endPosition;
									modifierValue.value = combinedPart.name;
									modifierValue.name = combinedPart.name;
									modifierValue.originalAbstractNode = combinedPart;

									if (modifierValue.endPosition == null && modifierValue.startPosition == null) {
										modifierValue.startPosition = next.startPosition;
										modifierValue.endPosition = next.endPosition;
									}

									values.push(modifierValue);
								}
							});
						} else {
							const modifierValue = new ModifierValueNode();
							modifierValue.startPosition = next.startPosition;
							modifierValue.endPosition = next.endPosition;
							modifierValue.value = next.name;
							modifierValue.name = next.name;
							modifierValue.originalAbstractNode = next;
							values.push(modifierValue);
						}
					} else {
						values.push(next);
					}

					i += 1;
					continue;
				} else {
					next.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_MODIFIER_UNEXPECTED_VALUE,
						next,
						'Unexpected [' + TypeLabeler.getPrettyTypeName(next) + '] while parsing modifier value.'
					));
					return tokens;
				}
			}
		}

		const modifierNode = new ModifierNode();
		modifierNode.nameNode = modifierName;
		modifierNode.valueNodes = values;
		modifierNode.startPosition = modifierNode.nameNode.startPosition;

		if (modifierNode.valueNodes.length > 0) {
			modifierNode.endPosition = modifierNode.valueNodes[modifierNode.valueNodes.length - 1].endPosition;
		} else {
			modifierNode.endPosition = modifierNode.nameNode.endPosition;
		}

		return modifierNode;
	}

	private scanToEndOfModifier(tokens: AbstractNode[]) {
		const subTokens: AbstractNode[] = [],
			tokenCount = tokens.length;

		for (let i = 0; i < tokenCount; i++) {
			const subToken = tokens[i];

			if (subToken instanceof ModifierValueSeparator) {
				const subTokenCount = subTokens.length;

				if (subTokenCount == 0) {
					subToken.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_PARSING_MODIFIER_VALUE,
						subToken,
						'Unexpected end of input while parsing modifier value.'
					));
					continue;
				}

				this.isRealModifierSeparator.set(subToken, true);
				const last = subTokens[subTokenCount - 1];

				if (NodeHelpers.distance(last, subToken) > 1) {
					break;
				}
			}

			if (subToken instanceof ModifierSeparator ||
				subToken instanceof LogicGroupEnd ||
				subToken instanceof LogicGroupBegin ||

				subToken instanceof EqualCompOperator ||
				subToken instanceof GreaterThanCompOperator ||
				subToken instanceof GreaterThanEqualCompOperator ||
				subToken instanceof LessThanCompOperator ||
				subToken instanceof LessThanEqualCompOperator ||
				subToken instanceof NotEqualCompOperator ||
				subToken instanceof NotStrictEqualCompOperator ||
				subToken instanceof SpaceshipCompOperator ||
				subToken instanceof StrictEqualCompOperator ||

				subToken instanceof LogicalAndOperator ||
				subToken instanceof LogicalOrOperator ||
				subToken instanceof LogicalXorOperator ||
				subToken instanceof NullCoalesceOperator ||
				subToken instanceof StringConcatenationOperator ||

				subToken instanceof LanguageOperatorConstruct ||
				subToken instanceof LibraryInvocationConstruct ||
				subToken instanceof MethodInvocationNode ||
				subToken instanceof LogicalNegationOperator) {
				break;
			} else {
				subTokens.push(subToken);
			}
		}

		return subTokens;
	}

	static isAssignmentOperatorNode(node: AbstractNode) {
		return node instanceof AdditionAssignmentOperator || node instanceof DivisionAssignmentOperator ||
			node instanceof LeftAssignmentOperator || node instanceof ModulusAssignmentOperator ||
			node instanceof MultiplicationAssignmentOperator || node instanceof SubtractionOperator;
	}

	private insertAutomaticStatementSeparators(tokens: AbstractNode[]) {
		const tokenCount = tokens.length,
			adjustedTokens: AbstractNode[] = [];

		for (let i = 0; i < tokenCount; i++) {
			const thisToken = tokens[i];

			if (LanguageParser.isAssignmentOperatorNode(thisToken)) {
				if (i + 2 < tokenCount) {
					const peek = tokens[i + 2];

					if (peek instanceof StatementSeparatorNode == false) {
						adjustedTokens.push(thisToken);
						adjustedTokens.push(tokens[i + 1]);
						adjustedTokens.push(new StatementSeparatorNode());
						i += 1;
						continue;
					} else {
						adjustedTokens.push(thisToken);
						adjustedTokens.push(tokens[i + 1]);
						adjustedTokens.push(tokens[i + 2]);
						i += 2;
						continue;
					}
				} else {
					adjustedTokens.push(thisToken);
					adjustedTokens.push(tokens[i + 1]);
					adjustedTokens.push(new StatementSeparatorNode());
					break;
				}
			} else {
				adjustedTokens.push(thisToken);
			}
		}

		return tokens;
	}

	private createSemanticGroups(tokens: AbstractNode[]) {
		const groups: AbstractNode[] = [],
			tokenCount = tokens.length;

		let groupNodes: AbstractNode[] = [];

		for (let i = 0; i < tokenCount; i++) {
			if (tokens[i] instanceof StatementSeparatorNode) {
				const semanticGroup = new SemanticGroup();
				semanticGroup.nodes = groupNodes;
				semanticGroup.separatorToken = tokens[i];

				groups.push(semanticGroup);
				groupNodes = [];
				continue;
			} else {
				groupNodes.push(tokens[i]);

				if (i + 1 >= tokenCount) {
					const semanticGroup = new SemanticGroup();
					semanticGroup.nodes = groupNodes;
					groups.push(semanticGroup);
					break;
				}
			}
		}

		return groups;
	}

	private findLogicalGroupEnd(root: LogicGroupBegin, nodes: AbstractNode[]): FindLogicGroupEndResult {
		const subNodes: AbstractNode[] = [],
			nodeCount = nodes.length;
		let end: AbstractNode | null = null,
			skipCount = 0,
			i = 0;

		for (i; i < nodeCount; i++) {
			const node = nodes[i];
			skipCount += 1;

			if (node instanceof LogicGroupEnd) {
				end = node;
				break;
			} else if (node instanceof LogicGroupBegin) {
				if (i + 1 >= nodeCount) {
					node.pushError(AntlersError.makeSyntaxError(
						AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_PARSING_LOGIC_GROUP_END,
						node,
						'Unexpected end of input while parsing input text.'
					));
					return {
						found: false,
						logicalGroup: null,
						skipCount: skipCount
					};
				}

				const subGroup = this.findLogicalGroupEnd(node, nodes.slice(i + 1));

				if (subGroup.found) {
					if (subGroup.logicalGroup != null) {
						subNodes.push(subGroup.logicalGroup);
					}

					skipCount += subGroup.skipCount;
					i += subGroup.skipCount;
					continue;
				} else {
					continue;
				}
			} else {
				subNodes.push(node);
			}
		}

		if (end == null) {
			root.pushError(AntlersError.makeSyntaxError(
				AntlersErrorCodes.TYPE_LOGIC_GROUP_NO_END,
				root,
				'Unexpected end of input while parsing logic group.'
			));
			return {
				found: false,
				logicalGroup: null,
				skipCount: skipCount
			};
		}

		const parser = new LanguageParser();
		parser.setIsRoot(false);

		let logicalGroup: LogicGroup | ScopedLogicGroup | AliasedScopeLogicGroup = new LogicGroup();

		if (subNodes.length >= 2 && subNodes[1] instanceof ScopeAssignmentOperator) {
			logicalGroup = new ScopedLogicGroup();
			logicalGroup.scopeOperator = subNodes[1];

			if (i + 2 < nodeCount && nodes[i + 1] instanceof VariableNode && nodes[i + 2] instanceof StringValueNode) {
				const candidateVarNode = nodes[i + 1] as VariableNode;

				if (candidateVarNode.name == LanguageKeywords.ScopeAs) {
					const aliasNode = nodes[i + 2] as StringValueNode;

					logicalGroup = new AliasedScopeLogicGroup();

					if (logicalGroup instanceof AliasedScopeLogicGroup) {
						logicalGroup.alias = aliasNode;
					}
					skipCount += 2;
				}
			}

			const scopedNodes = subNodes.splice(0, 2);

			if (logicalGroup instanceof ScopedLogicGroup || logicalGroup instanceof AliasedScopeLogicGroup) {
				logicalGroup.scope = scopedNodes[0] as VariableNode;
			}
		}

		logicalGroup.nodes = parser.parse(subNodes);
		logicalGroup.start = root;
		logicalGroup.end = end;
		logicalGroup.startPosition = root.startPosition;
		logicalGroup.endPosition = end.endPosition;

		if (logicalGroup instanceof AliasedScopeLogicGroup) {
			if (logicalGroup.alias != null) {
				logicalGroup.endPosition = logicalGroup.alias.endPosition;
			}
		}

		return {
			found: true,
			logicalGroup: logicalGroup,
			skipCount: skipCount
		};
	}

	private unpack(tokens: AbstractNode[]): AbstractNode[] {
		if (tokens.length == 0) {
			return [];
		}

		if (tokens[0] instanceof SemanticGroup) {
			const wSg = tokens[0] as SemanticGroup;

			return this.unpack(wSg.nodes);
		}

		return tokens;
	}

	private collectUntil(tokens: AbstractNode[]): CollectUntilResults {
		const len = tokens.length;
		let collectedTokens: AbstractNode[] = [];

		for (let i = len - 1; i >= 0; i--) {
			if (LanguageParser.isAssignmentOperator(tokens[i])) {
				break;
			}

			const token = tokens.pop() as AbstractNode;
			collectedTokens.push(token);
		}

		collectedTokens = collectedTokens.reverse();

		if (collectedTokens.length >= 3) {
			const parser = new LanguageParser();

			parser.setIsRoot(false);

			return {
				collectedTokens: this.unpack(parser.parse(collectedTokens)),
				tokens: tokens
			};
		}

		return {
			collectedTokens: collectedTokens,
			tokens: tokens
		};
	}

	private seek(type: any, startingAt: number): SeekResults {
		for (let i = startingAt; i < this.tokens.length; i++) {
			if (this.tokens[i] instanceof type) {
				return {
					found: true,
					foundAt: i,
					node: this.tokens[i]
				};
			}
		}

		return {
			found: false,
			foundAt: null,
			node: null
		};
	}
}

interface RightValueResult {
	value: AbstractNode | null,
	negationCount: number
}

interface FindLogicGroupEndResult {
	found: boolean,
	logicalGroup: LogicGroup | ScopedLogicGroup | AliasedScopeLogicGroup | null,
	skipCount: number
}

interface SeekResults {
	node: AbstractNode | null,
	foundAt: number | null,
	found: boolean
}

interface CollectUntilResults {
	tokens: AbstractNode[],
	collectedTokens: AbstractNode[]
}

interface ReducedObjectAccessorResult {
	accessor: string,
	accessorLen: number
}