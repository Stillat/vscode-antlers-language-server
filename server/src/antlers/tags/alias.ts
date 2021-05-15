import { IAntlersTag } from '../tagManager';

export function createDefinitionAlias(tag: IAntlersTag, alias: string): IAntlersTag {
	const tagCopy = copyTagDefinition(tag);

	tagCopy.tagName = alias;

	return tagCopy;
}

export function copyTagDefinition(tag: IAntlersTag): IAntlersTag {
	return {
		allowsArbitraryParameters: tag.allowsArbitraryParameters,
		allowsContentClose: tag.allowsContentClose,
		injectParentScope: tag.injectParentScope,
		parameters: tag.parameters,
		requiresClose: tag.requiresClose,
		tagName: tag.tagName,
		hideFromCompletions: tag.hideFromCompletions,
		augmentScope: tag.augmentScope,
		requiresCloseResolver: tag.requiresCloseResolver,
		resolveCompletionItems: tag.resolveCompletionItems,
		resolveDynamicParameter: tag.resolveDynamicParameter,
		resolveSpecialType: tag.resolveSpecialType,
		resovleParameterCompletionItems: tag.resovleParameterCompletionItems,
		suggestAlternativeParams: tag.suggestAlternativeParams
	};
}
