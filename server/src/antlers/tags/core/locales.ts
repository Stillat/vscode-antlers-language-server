import { CompletionItem } from 'vscode-languageserver';
import { makeTagDoc } from '../../../documentation/utils';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { tagToCompletionItem } from '../../documentedLabel';
import { Scope } from '../../scope/scope';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag } from "../../tagManager";
import { makeLocaleVariables } from "../../variables/localeVariables";
import LocalesCount from './localeCount';
import { LocaleParameters } from './localeParameters';

const LocalesCompletionItems: CompletionItem[] = [
    tagToCompletionItem(LocalesCount)
];

const Locales: IAntlersTag = {
    tagName: "locales",
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    injectParentScope: false,
    requiresClose: true,
    parameters: LocaleParameters,
    introducedIn: null,
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariableArray("locale", makeLocaleVariables(node));

        scope.addVariable({
            name: "current",
            dataType: "string",
            sourceField: null,
            sourceName: "*internal.locale",
            introducedBy: node,
        });
        scope.addVariable({
            name: "is_current",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.locale",
            introducedBy: node,
        });
        scope.addVariable({
            name: "exists",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.locale",
            introducedBy: node,
        });
        scope.addVariable({
            name: "permalink",
            dataType: "string",
            sourceField: null,
            sourceName: "*internal.locale",
            introducedBy: node,
        });

        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'locales Tag',
            'The `locales` tag can be used to access all the locales the current content is available in.',
            'https://statamic.dev/tags/locales'
        );
    },
    resolveCompletionItems: (params: ISuggestionRequest) => {
        if (params.isPastTagPart == false &&
            (params.leftWord == "locale" || params.leftWord == "/locale") &&
            params.leftChar == ":"
        ) {
            return exclusiveResult(LocalesCompletionItems);
        }

        return EmptyCompletionResult;
    }
};

export default Locales;
