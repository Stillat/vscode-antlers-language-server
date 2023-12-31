import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { makeTagDoc } from '../../../../documentation/utils.js';
import { makeFieldSuggest } from '../../../../suggestions/fieldFormatter.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { tagToCompletionItem } from '../../../documentedLabel.js';
import { EmptyCompletionResult, IAntlersTag, nonExclusiveResult } from '../../../tagManager.js';
import { createDefinitionAlias } from '../../alias.js';
import { augmentNavScope } from './augmentScope.js';
import NavBreadcrumbs from './breadcrumbs.js';
import { resolveNavParameterCompletions } from './parameterCompletions.js';
import NavParameters from './parameters.js';

const StructureTag: IAntlersTag = {
    tagName: 'structure',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    introducedIn: null,
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
                    items.push(tagToCompletionItem(NavBreadcrumbs));
                }

                items.push(makeFieldSuggest('collection', '', ''));

                items.push({ label: 'collection', kind: CompletionItemKind.Text });

                return nonExclusiveResult(items);
            }
        }

        if ((params.leftWord == 'nav:collection' || params.leftWord == '/nav:collection' || params.leftWord == 'collection' || params.leftWord == '/collection' ||
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
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'nav Tag',
            'The `nav` tag can be used to iterate structured collections or navigation menus.',
            'https://statamic.dev/tags/nav'
        );
    }
};


const NavTag = createDefinitionAlias(StructureTag, 'nav');

export { NavTag, StructureTag };
