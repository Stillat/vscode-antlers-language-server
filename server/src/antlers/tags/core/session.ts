import { CompletionItem, CompletionItemKind } from "vscode-languageserver-types";
import SessionVariableManager from "../../../references/sessionVariableManager";
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { tagToCompletionItem } from '../../documentedLabel';
import { Scope } from '../../scope/scope';
import { IScopeVariable } from '../../scope/types';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag } from "../../tagManager";
import SessionDump from './sessionDump';
import SessionFlash from './sessionFlash';
import SessionFlush from './sessionFlush';
import SessionForget from './sessionForget';
import SessionHas from './sessionHas';
import SessionSet from './sessionSet';

const SessionTagCompletionItems: CompletionItem[] = [
    tagToCompletionItem(SessionSet),
    tagToCompletionItem(SessionFlash),
    tagToCompletionItem(SessionForget),
    tagToCompletionItem(SessionFlush),
    tagToCompletionItem(SessionHas),
    tagToCompletionItem(SessionDump)
];

const SessionTag: IAntlersTag = {
    tagName: "session",
    requiresClose: false,
    allowsContentClose: true,
    allowsArbitraryParameters: false,
    hideFromCompletions: false,
    injectParentScope: false,
	introducedIn: null,
    parameters: [
        {
            name: "as",
            description: "An optional alias for the session data",
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            expectsTypes: ["string"],
            isDynamic: false,
            isRequired: false,
        },
    ],
    resolveCompletionItems: (params: ISuggestionRequest) => {
        if (
            params.isPastTagPart == false &&
            (params.leftWord == "session" || params.leftWord == "/session") &&
            params.leftChar == ":"
        ) {
            const knownSessionVars =
                SessionVariableManager.instance?.getKnownSessionVariableNames() ?? [];
            let sessionCompletions: CompletionItem[] = [];

            sessionCompletions = sessionCompletions.concat(SessionTagCompletionItems);

            for (let i = 0; i < knownSessionVars.length; i++) {
                sessionCompletions.push({
                    label: knownSessionVars[i],
                    kind: CompletionItemKind.Variable,
                });
            }

            return exclusiveResult(sessionCompletions);
        }

        return EmptyCompletionResult;
    },
    augmentScope: (node: AntlersNode, scope: Scope) => {
        const asParam = node.findParameter("as"),
            knownParams: string[] = SessionVariableManager.instance?.getKnownSessionVariableNames() ?? [],
            scopeVariables: IScopeVariable[] = [];

        for (let i = 0; i < knownParams.length; i++) {
            scopeVariables.push({
                dataType: "*",
                name: knownParams[i],
                sourceField: null,
                sourceName: "project.session",
                introducedBy: node,
            });
        }

        if (asParam == null) {
            scope.addVariables(scopeVariables);
        } else {
            scope.addVariableArray(asParam.value, scopeVariables);
        }

        return scope;
    },
};

export default SessionTag;
