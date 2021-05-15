import { ConditionalTokenType, IConditionalToken } from './conditionParser';

export class ConditionCompiler {

	static getText(type: ConditionalTokenType): string {
		if (type == ConditionalTokenType.String) {
			return 'STR';
		} else if (type == ConditionalTokenType.EqualityComparison) {
			return 'EQ';
		} else if (type == ConditionalTokenType.Literal) {
			return 'LIT';
		} else if (type == ConditionalTokenType.GreaterThanOrEqual) {
			return 'GTE';
		} else if (type == ConditionalTokenType.NotEqual) {
			return 'NE';
		} else if (type == ConditionalTokenType.TernaryIf) {
			return 'TIF';
		} else if (type == ConditionalTokenType.NullCoalesce) {
			return 'NQL';
		} else if (type == ConditionalTokenType.TagExpression) {
			return 'ATE';
		} else if (type == ConditionalTokenType.Or) {
			return 'OR';
		} else if (type == ConditionalTokenType.And) {
			return 'AND';
		} else if (type == ConditionalTokenType.ModifierTrigger) {
			return 'MTR';
		} else if (type == ConditionalTokenType.StrictEqualityOperator) {
			return 'EQ';
		}

		return 'LIT';
	}

	static compile(tokens: IConditionalToken[]): string {
		const parts: string[] = [];

		for (let i = 0; i < tokens.length; i++) {
			parts.push(this.getText(tokens[i].type));
		}

		return parts.join('*');
	}

}
