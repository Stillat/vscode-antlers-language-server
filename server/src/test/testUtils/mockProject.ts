import { ConditionParser } from '../../antlers/conditionParser';
import { AntlersParser } from '../../antlers/parser';
import { TagManager } from '../../antlers/tagManager';
import { MockProject, StatamicProject } from '../../projects/statamicProject';
import { getConditionInnerContent } from '../../suggestions/conditionSuggestionManager';
import { getTemplateContent } from './getTemplate';
const GenericPath = 'file:///parser/test.antlers.html';

export function makeTestProject(): StatamicProject {
	return MockProject;
}

export function parseString(text: string): AntlersParser {
	TagManager.loadCoreTags();

	const newParser = new AntlersParser();

	newParser.parseText(GenericPath, text, makeTestProject());


	return newParser;
}

export function parseTemplate(templateName: string): AntlersParser {
	return parseString(getTemplateContent(templateName));
}

export function parseCondition(text: string): ConditionParser {
	const parser = parseString(text),
		firstStatement = parser.getSymbol(0),
		offset = getConditionInnerContent(firstStatement);

	const conditionalParser = new ConditionParser();

	conditionalParser.setStartOffset(firstStatement.startLine, offset.offset + firstStatement.startOffset);
	conditionalParser.parseText(offset.content);

	return conditionalParser;
}
