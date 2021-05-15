import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { ISuggestionRequest } from '../../../../suggestions/suggestionManager';
import { EmptyCompletionResult, exclusiveResult, IAntlersParameter, IAntlersTag } from '../../../tagManager';

const ThemeTagCompletionItems: CompletionItem[] = [
	{ label: 'asset', kind: CompletionItemKind.Text },
	{ label: 'css', kind: CompletionItemKind.Text },
	{ label: 'img', kind: CompletionItemKind.Text },
	{ label: 'js', kind: CompletionItemKind.Text },
	{ label: 'output', kind: CompletionItemKind.Text },
	{ label: 'path', kind: CompletionItemKind.Text },
];

const ThemePathParameters: IAntlersParameter[] = [
	{
		isRequired: true,
		acceptsVariableInterpolation: false,
		aliases: [],
		allowsVariableReference: true,
		name: 'src',
		description: 'The relative path to the file',
		expectsTypes: ['string'],
		isDynamic: false
	},
	{
		isRequired: false,
		acceptsVariableInterpolation: false,
		aliases: [],
		allowsVariableReference: true,
		name: 'cache_bust',
		description: 'Whether to output the last modified date',
		expectsTypes: ['boolean'],
		isDynamic: false
	},
	{
		isRequired: false,
		acceptsVariableInterpolation: false,
		aliases: [],
		allowsVariableReference: true,
		name: 'version',
		description: 'Whether to check a versioning manifest to produce the final URL',
		expectsTypes: ['boolean'],
		isDynamic: false
	},
	{
		isRequired: false,
		acceptsVariableInterpolation: false,
		aliases: [],
		allowsVariableReference: true,
		name: 'absolute',
		description: 'Generate absolute URLs or not',
		expectsTypes: ['boolean'],
		isDynamic: false
	},
	{
		isRequired: false,
		acceptsVariableInterpolation: false,
		aliases: [],
		allowsVariableReference: true,
		name: 'locale',
		description: 'The locale the path should be generated in',
		expectsTypes: ['string'],
		isDynamic: false
	}
];

export { ThemePathParameters };

const Theme: IAntlersTag = {
	tagName: 'theme',
	hideFromCompletions: false,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	requiresClose: false,
	injectParentScope: false,
	parameters: ThemePathParameters,
	resolveCompletionItems: (params: ISuggestionRequest) => {
		if (params.isPastTagPart == false && (params.leftWord == 'theme' || params.leftWord == '/theme') && params.leftChar == ':') {
			return exclusiveResult(ThemeTagCompletionItems);
		}

		return EmptyCompletionResult;
	}
};

export default Theme;
