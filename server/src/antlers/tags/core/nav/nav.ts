import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { makeFieldSuggest } from '../../../../suggestions/fieldFormatter';
import { ISuggestionRequest } from '../../../../suggestions/suggestionManager';
import { EmptyCompletionResult, IAntlersTag, nonExclusiveResult } from '../../../tagManager';
import { createDefinitionAlias } from '../../alias';
import { augmentNavScope } from './augmentScope';
import { resolveNavParameterCompletions } from './parameterCompletions';
import NavParameters from './parameters';

const StructureTag: IAntlersTag = {
	tagName: 'structure',
	hideFromCompletions: false,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	requiresClose: true,
	injectParentScope: false,
	parameters: NavParameters,
	augmentScope: augmentNavScope,
	resovleParameterCompletionItems: resolveNavParameterCompletions,
	resolveCompletionItems: (params: ISuggestionRequest) => {
		const items: CompletionItem[] = [];

		if (params.isPastTagPart == false) {
			if ((params.leftWord == 'nav' || params.leftWord == '/nav' ||
				params.leftWord == 'structure' || params.leftWord == '/structure') && params.leftChar == ':') {
				const navNames = params.project.getUniqueNavigationMenuNames();

				for (let i = 0; i < navNames.length; i++) {
					items.push(makeFieldSuggest(navNames[i], '', ''));
				}

				if (params.leftWord == 'nav' || params.leftWord == '/nav') {
					items.push({ label: 'breadcrumbs', kind: CompletionItemKind.Text });
				}

				items.push(makeFieldSuggest('collection', '', ''));

				items.push({ label: 'collection', kind: CompletionItemKind.Text });

				return nonExclusiveResult(items);
			}
		}

		if ((params.leftWord == 'nav:collection' || params.leftWord == '/nav:collection' ||
			params.leftWord == 'structure:collection' || params.leftWord == '/structure:collection') && params.leftChar == ':') {
			const collectionNames = params.project.getUniqueCollectionNames();

			for (let i = 0; i < collectionNames.length; i++) {
				items.push({
					label: collectionNames[i],
					kind: CompletionItemKind.Field
				});
			}

			return nonExclusiveResult(items);
		}

		return EmptyCompletionResult;
	}
};


const NavTag = createDefinitionAlias(StructureTag, 'nav');

export { NavTag, StructureTag };
