import * as fs from 'fs';
import { IModifierParameter, ModifierManager } from '../antlers/modifierManager';
import { IAntlersParameter, TagManager } from '../antlers/tagManager';
import { ExtensionManager } from '../extensibility/extensionManager';
import { AugmentationManager } from './augmentationManager';
import { forceResetIndexState, safeRunIndexing } from './manifest';
import { ViewModelManager } from './viewModelManager';

export interface IManifestConifg {
	assetPresets: string[],
	siteNames: string[],
	oauthProviders: string[],
	searchIndexes: string[]
}
export interface IManifestTagParameter {
	name: string,
	description: string,
	expectsTypes: string[],
	isRequired: boolean,
	aliases: string[]
}

export interface IManifestTag {
	sourceFile: string,
	handle: string,
	name: string,
	compound: string,
	showInCompletions: boolean,
	parameters: IManifestTagParameter[]
}

export interface IManifestModifierParameter {
	name: string,
	description: string,
	acceptsTypes: string[],
	isRequired: boolean,
	aliases: string[]
}

export interface IManifestModifier {
	sourceFile: string,
	name: string,
	description: string,
	expectsTypes: string[],
	returnsTypes: string[],
	parameters: IManifestModifierParameter[]
}

export interface IContributedField {
	name: string,
	description: string,
	returnTypes: string[]
}

export interface IManifestAugmentationContribution {
	sourceFile: string,
	name: string,
	description: string,
	collections: string[],
	blueprints: string[],
	fields: IContributedField[]
}

export interface IManifestViewModel {
	name: string,
	fqn: string,
	sourceFile: string,
	fields: string[]
}

export interface IManifestQueryScope {
	sourceFile: string,
	name: string,
	description: string
}

export interface IComposerPackageManifest {
	packageName: string,

	tags: IManifestTag[],
	modifiers: IManifestModifier[],
	augmentContributions: IManifestAugmentationContribution[],
	queryScopes: IManifestQueryScope[],
	viewModels: IManifestViewModel[]
}

export interface IAntlersManifest {
	config: IManifestConifg,
	tags: IManifestTag[],
	modifiers: IManifestModifier[],
	augmentContributions: IManifestAugmentationContribution[],
	queryScopes: IManifestQueryScope[],
	viewModels: IManifestViewModel[],
	packageManifests: IComposerPackageManifest[]
}

let LoadedManifest: IAntlersManifest | null = null;

export { LoadedManifest };

function getRuntimeTagParamters(tag: IManifestTag): IAntlersParameter[] {
	const parameters: IAntlersParameter[] = [];

	for (let i = 0; i < tag.parameters.length; i++) {
		const thisParam = tag.parameters[i];

		parameters.push({
			acceptsVariableInterpolation: true,
			aliases: thisParam.aliases,
			allowsVariableReference: true,
			description: thisParam.description,
			expectsTypes: thisParam.expectsTypes,
			isDynamic: false,
			isRequired: thisParam.isRequired,
			name: thisParam.name
		});
	}

	return parameters;
}

function getRuntimeModifierParamters(modifier: IManifestModifier): IModifierParameter[] {
	const parameters: IModifierParameter[] = [];

	for (let i = 0; i < modifier.parameters.length; i++) {
		const parsedParam = modifier.parameters[i];

		parameters.push({
			description: parsedParam.description,
			name: parsedParam.name
		});
	}

	return parameters;
}

export class ManifestManager {
	static load(path: string) {
		try {
			const contents = fs.readFileSync(path, { encoding: 'utf8' }),
				parsedManifest = JSON.parse(contents) as IAntlersManifest;

			TagManager.reset();
			ModifierManager.reset();

			TagManager.registerTags(ExtensionManager.getAllRegisteredTags());
			ModifierManager.registerModifiers(ExtensionManager.getAllRegisteredModifiers());

			for (let i = 0; i < parsedManifest.tags.length; i++) {
				TagManager.registerTag({
					allowsArbitraryParameters: true,
					allowsContentClose: true,
					hideFromCompletions: !parsedManifest.tags[i].showInCompletions,
					injectParentScope: false,
					parameters: getRuntimeTagParamters(parsedManifest.tags[i]),
					requiresClose: false,
					tagName: parsedManifest.tags[i].compound
				});
			}

			ViewModelManager.reset();
			AugmentationManager.reset();
			ModifierManager.loadCoreModifiers();

			AugmentationManager.registerAugmentations(parsedManifest.augmentContributions);
			ViewModelManager.registerViewModels(parsedManifest.viewModels);

			for (let i = 0; i < parsedManifest.modifiers.length; i++) {
				const manifestModifier = parsedManifest.modifiers[i];

				let newAcceptedTypes = manifestModifier.expectsTypes,
					newReturnTypes = manifestModifier.returnsTypes;

				if (newAcceptedTypes == null || newAcceptedTypes.length == 0) {
					newAcceptedTypes = ['*'];
				}

				if (newReturnTypes == null || newReturnTypes.length == 0) {
					newReturnTypes = ['*'];
				}

				ModifierManager.registerModifier({
					acceptsType: newAcceptedTypes,
					canBeParameter: true,
					description: manifestModifier.description,
					docLink: '',
					name: manifestModifier.name,
					returnsType: newReturnTypes,
					parameters: getRuntimeModifierParamters(manifestModifier)
				});
			}

			for (let p = 0; p < parsedManifest.packageManifests.length; p++) {
				for (let i = 0; i < parsedManifest.packageManifests[p].tags.length; i++) {
					TagManager.registerTag({
						allowsArbitraryParameters: true,
						allowsContentClose: true,
						hideFromCompletions: !parsedManifest.packageManifests[p].tags[i].showInCompletions,
						injectParentScope: false,
						parameters: getRuntimeTagParamters(parsedManifest.packageManifests[p].tags[i]),
						requiresClose: false,
						tagName: parsedManifest.packageManifests[p].tags[i].compound
					});
				}

				for (let i = 0; i < parsedManifest.modifiers.length; i++) {
					const manifestModifier = parsedManifest.packageManifests[p].modifiers[i];

					let newAcceptedTypes = manifestModifier.expectsTypes,
						newReturnTypes = manifestModifier.returnsTypes;
	
					if (newAcceptedTypes == null || newAcceptedTypes.length == 0) {
						newAcceptedTypes = ['*'];
					}
	
					if (newReturnTypes == null || newReturnTypes.length == 0) {
						newReturnTypes = ['*'];
					}

					ModifierManager.registerModifier({
						acceptsType: newAcceptedTypes,
						canBeParameter: true,
						description: manifestModifier.description,
						docLink: '',
						name: manifestModifier.name,
						returnsType: newReturnTypes,
						parameters: getRuntimeModifierParamters(manifestModifier)
					});
				}
			}

			LoadedManifest = parsedManifest;
		} catch (err) {
			if (err instanceof SyntaxError) {
				const syntaxError = err as SyntaxError;

				if (syntaxError.message.includes('Unexpected end of JSON')) {
					fs.unlinkSync(path);
					forceResetIndexState();
					safeRunIndexing();
				}
			}
		}
	}
}


