import { Position } from 'vscode-languageserver-textdocument';
import { isCursorInsideSymbol, isPastTagPart, resolveActiveParameter } from '../antlers/concerns/resolvesPositionScope';
import { AntlersParser } from '../antlers/parser';
import { TagManager } from '../antlers/tagManager';
import { MockProject } from '../projects/statamicProject';
import { currentStructure, documentMap, parserInstances } from '../session';
import { ISuggestionRequest } from '../suggestions/suggestionManager';
import { trimLeft, trimRight } from '../utils/strings';

export function makeProviderRequest(position: Position, documentUri: string): ISuggestionRequest {
	const parser = parserInstances.get(documentUri) as AntlersParser;

	let leftChar = '',
		leftWord = '',
		rightChar = '',
		nonAdjustdLeftWord = '',
		nextLeftMeaningfulWord: string | null = null,
		rightWord = '';

	// Resolve some information to help make decisions later.
	if (documentMap.has(documentUri)) {
		const doc = documentMap.get(documentUri);

		if (doc != null && parser != null) {
			leftWord = parser.getWordToLeft(position.line, position.character - 1) ?? '';
			rightWord = parser.getWordToRight(position.line, position.character) ?? '';
			leftChar = leftWord[leftWord.length - 1];
			rightChar = parser.getCharToRight(position.line, position.character - 1) ?? '';
			nextLeftMeaningfulWord = parser.getNextMeaningfulWordToLeft(position.line, position.character);

			nonAdjustdLeftWord = leftWord;
		}
	}

	if (nextLeftMeaningfulWord != null) {
		nextLeftMeaningfulWord = nextLeftMeaningfulWord.trim();

		if (nextLeftMeaningfulWord.length == 0) {
			nextLeftMeaningfulWord = null;
		} else {
			nextLeftMeaningfulWord = trimRight(nextLeftMeaningfulWord, ':');
		}
	}

	if (leftWord.includes('{')) {
		leftWord = trimLeft(leftWord.substr(leftWord.lastIndexOf('{')), '{');
	}

	const activeDataScopes = parser.resolveScope(position),
		lastSymbolInScope = activeDataScopes[activeDataScopes.length - 1],
		activeParameter = resolveActiveParameter(position, lastSymbolInScope);
	let structureToUse = MockProject;

	if (currentStructure != null) {
		structureToUse = currentStructure;
	}

	const suggestionRequest: ISuggestionRequest = {
		document: documentUri,
		leftMeaningfulWord: nextLeftMeaningfulWord,
		leftChar: leftChar,
		leftWord: trimRight(leftWord, ':'),
		originalLeftWord: nonAdjustdLeftWord,
		rightWord: trimLeft(rightWord, ':'),
		rightChar: rightChar,
		activeParameter: activeParameter,
		activeInterpolation: null,
		position: position,
		project: structureToUse,
		symbolsInScope: activeDataScopes,
		isInDoubleBraces: false,
		isInVariableInterpolation: false,
		interpolationStartsOn: null,
		currentSymbol: lastSymbolInScope,
		isCaretInTag: false,
		isPastTagPart: false
	};

	if (activeParameter != null && activeParameter.containsInterpolation) {
		for (let i = 0; i < activeParameter.interpolations.length; i++) {
			const thisInterpolation = activeParameter.interpolations[i];

			if ((position.character + 1) >= thisInterpolation.startOffset && position.character <= thisInterpolation.endOffset) {
				suggestionRequest.isInVariableInterpolation = true;
				suggestionRequest.interpolationStartsOn = thisInterpolation.startOffset;
				suggestionRequest.currentSymbol = thisInterpolation.symbols[0];

				suggestionRequest.symbolsInScope.push(thisInterpolation.symbols[0]);
				suggestionRequest.activeInterpolation = thisInterpolation;
				break;
			}
		}
	}

	if (suggestionRequest.symbolsInScope.length > 0) {
		suggestionRequest.isPastTagPart = isPastTagPart(suggestionRequest.symbolsInScope[suggestionRequest.symbolsInScope.length - 1], position);
	}

	if (suggestionRequest.currentSymbol != null) {
		suggestionRequest.isInDoubleBraces = isCursorInsideSymbol(suggestionRequest.currentSymbol, position);
		suggestionRequest.isCaretInTag = TagManager.isSymbolKnownTag(suggestionRequest.currentSymbol);
	}

	return suggestionRequest;
}
