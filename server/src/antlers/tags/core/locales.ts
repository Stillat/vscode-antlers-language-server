import { CompletionItem } from 'vscode-languageserver';;
import { makeTagDoc } from '../../../documentation/utils.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { tagToCompletionItem } from '../../documentedLabel.js';
import { Scope } from '../../scope/scope.js';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag } from "../../tagManager.js";
import { makeLocaleVariables } from "../../variables/localeVariables.js";
import LocalesCount from './localeCount.js';
import { LocaleParameters } from './localeParameters.js';

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
