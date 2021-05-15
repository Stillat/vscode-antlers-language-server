import { Position } from 'vscode-languageserver-textdocument';
import { ConditionalTokenType, IConditionalToken } from './conditionParser';

const ValidModifierTokens: ConditionalTokenType[] = [
	ConditionalTokenType.Literal
];

export interface IOperandContext {
	leftOperand: IConditionalToken | null,
	operator: IConditionalToken | null
}

export function isOperandContextEmpty(context: IOperandContext): boolean {
	if (context.leftOperand != null && context.operator != null) {
		return false;
	}

	return true;
}

export class ConditionSearcher {

	private searchTokens: IConditionalToken[] = [];
	private lastToken: IConditionalToken | null = null;
	private typeHistory: ConditionalTokenType[] = [];
	private tokenHistory: IConditionalToken[] = [];

	setTokens(tokens: IConditionalToken[]) {
		this.searchTokens = tokens;
	}

	getActiveOperandContext(): IOperandContext {
		let leftOperand: IConditionalToken | null = null,
			operator: IConditionalToken | null = null;

		if (this.tokenHistory.length >= 3) {
			leftOperand = this.tokenHistory[this.tokenHistory.length - 3];
			operator = this.tokenHistory[this.tokenHistory.length - 2];
		}

		return {
			leftOperand: leftOperand,
			operator: operator
		};
	}

	getActiveToken(position: Position): IConditionalToken | null {
		this.typeHistory = [];
		this.tokenHistory = [];

		const seekLine = position.line;

		for (let i = 0; i < this.searchTokens.length; i++) {
			const token = this.searchTokens[i];

			this.tokenHistory.push(token);

			if (token.endLine > token.startLine && seekLine == token.startLine && position.character > token.start) {
				this.lastToken = token;

				return token;
			} else if (token.endLine > token.startLine && token.endLine == seekLine && position.character < token.end) {
				this.lastToken = token;

				return token;
			} else if (token.endLine == token.startLine && position.character == token.start && token.start == (token.end - 1)) {
				this.lastToken = token;

				return token;
			} else if (token.endLine == token.startLine && position.character >= token.start && position.character <= (token.end - 1)) {
				this.lastToken = token;

				return token;
			}

			this.typeHistory.push(token.type);
		}

		return null;
	}

	isRightOfModifier(position: Position): boolean {
		const activeToken = this.getActiveToken(position),
			history = this.typeHistory;

		if (history.length == 0) {
			return false;
		}

		const lastType = history[history.length - 1];

		if (activeToken == null && lastType == ConditionalTokenType.ModifierTrigger) {
			return true;
		}

		if (activeToken != null) {
			if (activeToken.type == ConditionalTokenType.ModifierTrigger) {
				return true;
			}

			if (ValidModifierTokens.includes(activeToken.type)) {

				if (lastType == ConditionalTokenType.ModifierTrigger) {
					return true;
				}
			}
		}

		return false;
	}

	isActiveOfType(position: Position, type: ConditionalTokenType): boolean {
		const activeToken = this.getActiveToken(position);

		if (activeToken == null) { return false; }

		return activeToken.type == type;
	}

	isInTagExpression(position: Position): boolean {
		return this.isActiveOfType(position, ConditionalTokenType.TagExpression);
	}

	isInString(position: Position): boolean {
		return this.isActiveOfType(position, ConditionalTokenType.String);
	}

	getLastToken(): IConditionalToken | null {
		return this.lastToken;
	}

}
