import { getTranslationSuggestions } from '../../../suggestions/project/translationCompletions';
import { getCurrentSymbolMethodNameValue } from '../../../suggestions/suggestionManager';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { EmptyCompletionResult, exclusiveResult, IAntlersParameter, IAntlersTag, ICompletionResult } from '../../tagManager';
import { createDefinitionAlias } from '../alias';
import { returnDynamicParameter } from '../dynamicParameterResolver';

const TranslateTriggerTagNames = [
    'translate', 'trans', 'trans_choice'
];

const Translate: IAntlersTag = {
    tagName: 'translate',
    hideFromCompletions: false,
    requiresClose: false,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: true,
    parameters: [
        {
            isRequired: false,
            name: 'key',
            description: 'The key of the translation string to find',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            expectsTypes: ['string'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'locale',
            description: 'The locale to be used when translating',
            acceptsVariableInterpolation: false,
            aliases: ['site'],
            allowsVariableReference: false,
            expectsTypes: ['string'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'count',
            description: 'The number of items to use for pluralization',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            expectsTypes: ['number'],
            isDynamic: false,
        }
    ],
    resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
        if (parameter.name == 'key') {
            let curValue = '';


            if (params.context?.parameterContext != null && params.context.parameterContext.parameter != null) {
                curValue = params.context.parameterContext.parameter.value;
            }

            return exclusiveResult(getTranslationSuggestions(
                curValue,
                params.project
            ));
        }
        return EmptyCompletionResult;
    },
    resolveDynamicParameter: returnDynamicParameter,
    resolveCompletionItems: (params: ISuggestionRequest): ICompletionResult => {
        if (params.leftMeaningfulWord != null && TranslateTriggerTagNames.includes(params.leftMeaningfulWord)) {
            const existingTranslateValue = getCurrentSymbolMethodNameValue(params);

            return exclusiveResult(getTranslationSuggestions(existingTranslateValue, params.project));
        }
        return EmptyCompletionResult;
    }
};

const TransTag: IAntlersTag = createDefinitionAlias(Translate, 'trans');
const TransChoiceTag: IAntlersTag = createDefinitionAlias(Translate, 'trans_choice');

export { Translate, TransTag, TransChoiceTag };
