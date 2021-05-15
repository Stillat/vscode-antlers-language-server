import { Range, Position, SemanticTokensBuilder } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { AntlersParser } from '../antlers/parser';
import { IParsedToken, Tokenizer } from '../highlighting/tokenizer';
import { parserInstances } from '../session';

export interface SemanticTokenProvider {
	readonly legend: { types: string[]; modifiers: string[] };
	getSemanticTokens(document: TextDocument, ranges?: Range[]): Promise<number[]>;
}

const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

export function newSemanticTokenProvider(): SemanticTokenProvider {
	const legend = {
		types: [
			'comment', 'string', 'keyword', 'number', 'regexp', 'operator', 'namespace',
			'type', 'struct', 'class', 'interface', 'enum', 'typeParameter', 'function',
			'method', 'macro', 'variable', 'parameter', 'property', 'label'
		], modifiers: [
			'declaration', 'documentation', 'readonly', 'static', 'abstract', 'deprecated',
			'modification', 'async']
	};

	legend.types.forEach((tokenType, index) => tokenTypes.set(tokenType, index));

	legend.modifiers.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));
	return {
		legend,
		async getSemanticTokens(document: TextDocument, ranges?: Range[]): Promise<number[]> {
			const docPath = decodeURIComponent(document.uri);
			let allTokens: IParsedToken[] = [];

			if (parserInstances.has(docPath)) {
				const antlersParser = parserInstances.get(docPath) as AntlersParser;
				allTokens = Tokenizer.getTokens(antlersParser.getSymbols());

			}
			const builder = new SemanticTokensBuilder();

			allTokens.forEach((token) => {
				builder.push(token.line, token.startCharacter, token.length, _encodeTokenType(token.tokenType), _encodeTokenModifiers(token.tokenModifiers));
			});

			return builder.build().data;
		}
	};
}

function _encodeTokenModifiers(strTokenModifiers: string[]): number {
	let result = 0;
	for (let i = 0; i < strTokenModifiers.length; i++) {
		const tokenModifier = strTokenModifiers[i];
		if (tokenModifiers.has(tokenModifier)) {
			result = result | (1 << tokenModifiers.get(tokenModifier)!);
		} else if (tokenModifier === 'notInLegend') {
			result = result | (1 << tokenModifiers.size + 2);
		}
	}
	return result;
}

function _encodeTokenType(tokenType: string): number {
	if (tokenTypes.has(tokenType)) {
		return tokenTypes.get(tokenType)!;
	} else if (tokenType === 'notInLegend') {
		return tokenTypes.size + 2;
	}
	return 0;
}
