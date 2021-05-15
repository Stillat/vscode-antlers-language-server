import { IModifier, ModifierManager } from '../antlers/modifierManager';
import { IAntlersParameter, IAntlersTag, TagManager } from '../antlers/tagManager';
import { IComposerPackage } from '../composer/lockFileParser';
import { DiagnosticsManager, IDiagnosticsHandler } from '../diagnostics/diagnosticsManager';
import { IBlueprintField } from '../projects/blueprints';
import { currentStructure, IView } from '../projects/statamicProject';
import { ContextManager } from './contextManager';
import { ExtensionHost } from './extensionHost';
import { GeneralHoverHandler, ModifierHoverHandler, ParameterHoverHandler, ParameterSuggestionHandler, ScopeVariableHoverHandler, SuggestionHandler, TagHoverHandler, TagSuggestionHandler } from './extensionManager';
import { Version } from './version';

export class ExtensionContext {
	public version: Version;

	private extensionHost: ExtensionHost;
	private suggestionHandler: SuggestionHandler | null = null;
	private modifierSuggestionHandler: SuggestionHandler | null = null;
	private parameterSuggestionHandler: ParameterSuggestionHandler | null = null;
	private tagSuggestionHandler: TagSuggestionHandler | null = null;

	private generalHoverHandler: GeneralHoverHandler | null = null;
	private modifierHoverHandler: ModifierHoverHandler | null = null;
	private tagHoverHandler: TagHoverHandler | null = null;
	private parameterHoverHandler: ParameterHoverHandler | null = null;
	private scopeVariableHoverHandler: ScopeVariableHoverHandler | null = null;
	private registeredTags: IAntlersTag[] = [];
	private registeredModifiers: IModifier[] = [];
	private registeredHandlers: IDiagnosticsHandler[] = [];

	getRegisteredTags(): IAntlersTag[] {
		return this.registeredTags;
	}

	getRegisteredModifiers(): IModifier[] {
		return this.registeredModifiers;
	}

	getRegisteredDiagnosticsHandlers(): IDiagnosticsHandler[] {
		return this.registeredHandlers;
	}

	getGeneralHoverHandler(): GeneralHoverHandler | null {
		return this.generalHoverHandler;
	}

	getModifierHoverHandler(): ModifierHoverHandler | null {
		return this.modifierHoverHandler;
	}

	getTagHoverHandler(): TagHoverHandler | null {
		return this.tagHoverHandler;
	}

	getParameterHoverHandler(): ParameterHoverHandler | null {
		return this.parameterHoverHandler;
	}

	getScopeVariableHoverHandler(): ScopeVariableHoverHandler | null {
		return this.scopeVariableHoverHandler;
	}

	getCompletionsSuggestionHandler(): SuggestionHandler | null {
		return this.suggestionHandler;
	}

	getModifierCompletionSuggestionsHandler(): SuggestionHandler | null {
		return this.modifierSuggestionHandler;
	}

	getParameterCompletionSuggestionHandler(): ParameterSuggestionHandler | null {
		return this.parameterSuggestionHandler;
	}

	getTagCompletionSuggestionHandler(): TagSuggestionHandler | null {
		return this.tagSuggestionHandler;
	}

	constructor(extensionHost: ExtensionHost) {
		this.extensionHost = extensionHost;
		this.version = new Version();
	}

	/**
	 * Attempts to retrieve Composer package details for the provided addon.
	 * 
	 * @param {string} addonName The name of the addon.
	 * @returns
	 */
	getStatamicAddon(addonName: string): IComposerPackage | null {
		if (currentStructure == null) {
			return null;
		}

		return currentStructure.getAddonDetails(addonName);
	}

	/**
	 * Returns the currently installed Statamic version.
	 * 
	 * @returns 
	 */
	getStatamicVersion(): string {
		if (currentStructure == null) {
			return '';
		}

		return currentStructure.getStatamicVersion();
	}

	/**
	 * Tests if a Composer package with the given name is available.
	 * 
	 * @param {string} packageName  The package name.
	 * @returns 
	 */
	hasComposerPackage(packageName: string): boolean {
		if (currentStructure == null) {
			return false;
		}

		return currentStructure.hasComposerPackage(packageName);
	}

	/**
	 * Attempts to retrieve Composer package details for the provided package name.
	 * 
	 * @param {string} packageName The package name.
	 * @returns 
	 */
	getComposerPackage(packageName: string): IComposerPackage | null {
		if (currentStructure == null) {
			return null;
		}

		return currentStructure.getComposerPackageDetails(packageName);
	}

	/**
	 * Tests if a Statamic addon is available.
	 * 
	 * @param {string} addonName  The addon name.
	 * @returns 
	 */
	hasStatamicAddon(addonName: string): boolean {
		if (currentStructure == null) {
			return false;
		}

		return currentStructure.hasStatamicAddon(addonName);
	}

	/**
	 * Retreives all partials defined by the developer.
	 * 
	 * @returns 
	 */
	getPartials(): IView[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getPartials();
	}

	/**
	 * Attempts to locate view information for the provided document URI.
	 * 
	 * @param {string} documentUri  The document URI.
	 * @returns 
	 */
	findView(documentUri: string): IView | null {
		if (currentStructure == null) {
			return null;
		}

		return currentStructure.findView(documentUri);
	}

	/**
	 * Attempts to locate view information for the provided partial name.
	 * 
	 * @param {string} name The partial name.
	 * @returns 
	 */
	findPartial(name: string): IView | null {
		if (currentStructure == null) {
			return null;
		}

		return currentStructure.findPartial(name);
	}

	/**
	 * Locates blueprint field information for the given blueprint handle.
	 * 
	 * @param {string} handle The blueprint handle.
	 * @returns 
	 */
	getBlueprintFields(handle: string): IBlueprintField[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getBlueprintDetails(handle);
	}

	/**
	 * Returns all known public asset paths.
	 * 
	 * Not currently implemented.
	 * 
	 * @returns 
	 */
	getPublicAssetPaths(): string[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getPublicAssetPaths();
	}

	/**
	 * Returns all known terms for a given taxonomy.
	 * 
	 * @param {string} name  The taxonomy name.
	 * @returns 
	 */
	getTaxonomyTerms(name: string): string[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getTaxonomyTerms(name);
	}

	/**
	 * Tests if a taxonomy with the given name exists.
	 * 
	 * @param {string} name  The taxonomy name.
	 * @returns 
	 */
	hasTaxonomy(name: string): boolean {
		if (currentStructure == null) {
			return false;
		}

		return currentStructure.hasTaxonomy(name);
	}

	/**
	 * Returns all blueprint fields for the provided collections.
	 * 
	 * @param {string[]} collections The collection handles.
	 * @returns 
	 */
	getCollectionBlueprintFields(collections: string[]): IBlueprintField[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getBlueprintFields(collections);
	}

	/**
	 * Retrieves information on a single blueprint field.
	 * 
	 * @param {string} blueprintName The blueprint or collection name.
	 * @param {string} fieldHandle The field handle.
	 * @returns 
	 */
	getBlueprintField(blueprintName: string, fieldHandle: string): IBlueprintField | null {
		if (currentStructure == null) {
			return null;
		}

		return currentStructure.getBlueprintField(blueprintName, fieldHandle);
	}

	/**
	 * Retrieves blueprint fields for the provided taxonomy names.
	 * 
	 * @param {string[]} taxonomyNames The taxonomies.
	 * @returns 
	 */
	getTaxonomyBlueprintFields(taxonomyNames: string[]): IBlueprintField[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getTaxonomyBlueprintFields(taxonomyNames);
	}

	/**
	 * Retrieves bluieprint fields for the default "users" blueprint.
	 * @returns 
	 */
	getUserFields(): IBlueprintField[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getUserFields();
	}

	/**
	 * Retrieves blueprint fields for the provided form.
	 * 
	 * @param {string} handle The form handle.
	 * @returns 
	 */
	getFormBlueprintFields(handle: string): IBlueprintField[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getFormBlueprintFields(handle);
	}

	/**
	 * Retrieves blueprint fields for the provided asset container.
	 * 
	 * @param {string} handle The asset handle.
	 * @returns 
	 */
	getAssetBlueprintFields(handle: string): IBlueprintField[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getAssetBlueprintFields(handle);
	}

	/**
	 * 
	 * Returns all known Glide presets.
	 * 
	 * @returns
	 */
	getGlidePresets(): string[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getAssetPresets();
	}

	/**
	 * Retreives a list of all unique taxonomy names.
	 * 
	 * @returns 
	 */
	getTaxonomyNames(): string[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getUniqueTaxonomyNames();
	}

	/**
	 * Retrieves a list of all unique collection names.
	 * 
	 * @returns 
	 */
	getCollectionNames(): string[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getUniqueCollectionNames();
	}

	/**
	 * Retrieves a list of all unique partial names.
	 * 
	 * @returns
	 */
	getPartialNames(): string[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getUniquePartialNames();
	}

	/**
	 * Retrieves a list of all unique user group names.
	 * 
	 * @returns 
	 */
	getUserGroupNames(): string[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getUniqueUserGroupNames();
	}

	/**
	 * Retrieves a list of all unique form handles.
	 * 
	 * @returns 
	 */
	getFormNames(): string[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getUniqueFormNames();
	}

	/**
	 * Retrieves a list of all unique global setting containers.
	 * 
	 * @returns 
	 */
	getGlobalsNames(): string[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getUniqueGlobalsNames();
	}

	/**
	 * Retrieves a list of all configured navigation structures/menus.
	 * 
	 * @returns 
	 */
	getNavigationNames(): string[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getUniqueNavigationMenuNames();
	}

	/**
	 * Retrieves a list of all unique asset names.
	 * 
	 * @returns 
	 */
	getAssetNames(): string[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getUniqueAssetNames();
	}

	/**
	 * Retrieves a list of all unique route names.
	 * 
	 * @returns 
	 */
	getRouteNames(): string[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getRouteNames();
	}

	/**
	 * Retrieves a list of all unique translation keys.
	 * 
	 * @returns 
	 */
	getTranslationKeys(): string[] {
		if (currentStructure == null) {
			return [];
		}

		return currentStructure.getTranslationKeys();
	}

	/**
	 * Registers a new diagnostics handler to test for and report errors.
	 * 
	 * @param {IDiagnosticsHandler} handler The diagnostics handler.
	 */
	registerDiagnosticsHandler(handler: IDiagnosticsHandler) {
		this.registeredHandlers.push(handler);

		DiagnosticsManager.registerHandler(handler);
	}

	/**
	 * Registers a new Antlers tag with the core engine.
	 * 
	 * @param {IAntlersTag} tag The tag instance.
	 */
	registerTag(tag: IAntlersTag) {
		ContextManager.registerTagMapping(this.extensionHost.getExtensionName(), tag.tagName);
		this.registeredTags.push(tag);

		TagManager.registerTag(tag);
	}

	/**
	 * Registers a collection of Antlers tags with the core engine.
	 * 
	 * @param {IAntlersTag[]} tags The tags to register.
	 */
	registerTags(tags: IAntlersTag[]) {
		tags.forEach((tag: IAntlersTag) => {
			this.registeredTags.push(tag);
			ContextManager.registerTagMapping(this.extensionHost.getExtensionName(), tag.tagName);
		});

		TagManager.registerTags(tags);
	}

	/**
	 * Registers a basic Antlers tag, with the provided parameters.
	 * 
	 * @param {string} tagName The new tag name.
	 * @param {IAntlersParameter[]} parameters The parameters, if any.
	 */
	providesTag(tagName: string, parameters: IAntlersParameter[]) {
		ContextManager.registerTagMapping(this.extensionHost.getExtensionName(), tagName);

		const newTag = {
			tagName: tagName,
			requiresClose: false,
			allowsArbitraryParameters: true,
			allowsContentClose: true,
			hideFromCompletions: false,
			injectParentScope: true,
			parameters: parameters
		};

		this.registeredTags.push(newTag);

		TagManager.registerTag(newTag);
	}

	/**
	 * Registers a new modifier with the core engine.
	 * 
	 * @param {IModifier} modifier The modifier.
	 */
	registerModifier(modifier: IModifier) {
		ContextManager.registerModifierMapping(this.extensionHost.getExtensionName(), modifier.name);
		this.registeredModifiers.push(modifier);

		ModifierManager.registerModifier(modifier);
	}

	/**
	 * Registers a collection of modifiers with the core engine.
	 * 
	 * @param {IModifier[]} modifiers The modifiers.
	 */
	registerModifiers(modifiers: IModifier[]) {
		modifiers.forEach((modifier: IModifier) => {
			this.registeredModifiers.push(modifier);
			ContextManager.registerModifierMapping(this.extensionHost.getExtensionName(), modifier.name);
		});

		ModifierManager.registerModifiers(modifiers);
	}

	/**
	 * Registers a simple modifier with the core engine.
	 * 
	 * @param {string} modifierName The modifier name.
	 * @param {string[]} expectsTypes The expected types, if any.
	 * @param {string[]} returnsTypes The return types, if any.
	 */
	providesModifier(modifierName: string, expectsTypes: string[], returnsTypes: string[]) {
		ContextManager.registerModifierMapping(this.extensionHost.getExtensionName(), modifierName);
		const newModifier = {
			name: modifierName,
			docLink: '',
			canBeParameter: false,
			description: '',
			parameters: [],
			acceptsType: expectsTypes,
			returnsType: returnsTypes
		};

		this.registeredModifiers.push(newModifier);

		ModifierManager.registerModifier(newModifier);
	}

	onGeneralCompletionRequest(handler: SuggestionHandler | null) {
		this.suggestionHandler = handler;
	}

	onModifierCompletionRequest(handler: SuggestionHandler | null) {
		this.modifierSuggestionHandler = handler;
	}

	onParameterCompletionRequest(handler: ParameterSuggestionHandler | null) {
		this.parameterSuggestionHandler = handler;
	}

	onTagCompletionRequest(handler: TagSuggestionHandler | null) {
		this.tagSuggestionHandler = handler;
	}

	onGeneralHover(handler: GeneralHoverHandler | null) {
		this.generalHoverHandler = handler;
	}

	onModifierHover(handler: ModifierHoverHandler | null) {
		this.modifierHoverHandler = handler;
	}

	onParameterHover(handler: ParameterHoverHandler | null) {
		this.parameterHoverHandler = handler;
	}

	onScopeVariableHover(handler: ScopeVariableHoverHandler | null) {
		this.scopeVariableHoverHandler = handler;
	}

}
