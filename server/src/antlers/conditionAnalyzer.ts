import { ConditionalTokenType, IConditionalToken } from './conditionParser';
import { ISymbol } from './types';

export class ConditionAnalyzer {


	analyzeToken(symbol: ISymbol, token: IConditionalToken): IConditionalToken {
		const tokens: IConditionalToken[] = [token],
			results = this.analyze(symbol, tokens);

		return results[0];
	}

	analyze(symbol: ISymbol, tokens: IConditionalToken[]): IConditionalToken[] {
		if (symbol.currentScope == null) {
			return tokens;
		}

		const adjustedTokens: IConditionalToken[] = [];

		for (let i = 0; i < tokens.length; i++) {
			if (tokens[i].type == ConditionalTokenType.Literal) {
				const token = tokens[i];
				const varReference = symbol.currentScope.findReference(token.content.trim());

				if (varReference != null) {
					adjustedTokens.push({
						content: token.content,
						end: token.end,
						endLine: token.endLine,
						start: token.startLine,
						startLine: token.startLine,
						type: token.type,
						context: {
							manifestType: varReference.dataType,
							reference: varReference
						},
						modifiers: token.modifiers
					});
				} else {
					adjustedTokens.push(token);
				}
			} else {
				adjustedTokens.push(tokens[i]);
			}
		}

		return adjustedTokens;
	}

}
