import { IBlueprintField } from '../../projects/blueprints';
import { getConditionInnerContent } from '../../suggestions/conditionSuggestionManager';
import { ConditionAnalyzer } from '../conditionAnalyzer';
import { ConditionCompiler } from '../conditionCompiler';
import { ConditionParser } from '../conditionParser';
import { ISymbol } from '../types';

const ValidConditions: string[] = ['if', 'elseif', 'unless', 'elseunless'];
const ConditionalScopeTriggers: string[] = ['bard', 'replicator'];

export class ConditionScopeInjections {

	static analyze(symbol: ISymbol, allSymbols: ISymbol[]): IBlueprintField[] {
		if (ValidConditions.includes(symbol.name) == false) { return []; }

		const conditionalParser = new ConditionParser(),
			contentOffset = getConditionInnerContent(symbol);

		conditionalParser.setStartOffset(symbol.startLine, contentOffset.offset + symbol.startOffset);
		conditionalParser.parseText(contentOffset.content);

		const tokens = conditionalParser.getTokens(),
			expression = ConditionCompiler.compile(tokens);

		if (expression == 'LIT*EQ*STR') {
			const analyzer = new ConditionAnalyzer(),
				analysisResults = analyzer.analyze(symbol, tokens);

			if (analysisResults.length >= 3) {
				const checkSet = analysisResults[2].content,
					leftOperand = analysisResults[0];

				if (leftOperand != null && leftOperand.context != null && leftOperand.context.reference != null) {
					const contextReference = leftOperand.context.reference;

					if (contextReference.introducedBy != null && contextReference.introducedBy.scopeVariable != null) {
						const scopeVariable = contextReference.introducedBy.scopeVariable;

						if (ConditionalScopeTriggers.includes(scopeVariable.dataType) && scopeVariable.sourceField != null) {
							if (scopeVariable.sourceField.sets != null && scopeVariable.sourceField.sets.length > 0) {
								const sourceSets = scopeVariable.sourceField.sets;

								for (let i = 0; i < sourceSets.length; i++) {
									if (sourceSets[i].handle == checkSet.trim()) {
										return sourceSets[i].fields;
									}
								}
							}
						}
					}
				}
			}
		}

		return [];
	}

}
