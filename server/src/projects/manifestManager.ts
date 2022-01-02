import ModifierManager from '../antlers/modifierManager';
import { IModifierParameter } from '../antlers/modifierTypes';
import { IAntlersParameter } from "../antlers/tagManager";
import TagManager from "../antlers/tagManagerInstance";
import AugmentationManager from './augmentationManager';
import {
    IAntlersManifest,
    IManifestTag,
    IManifestModifier,
} from "./manifest/manifestTypes";
import ViewModelManager from './viewModelManager';

function getRuntimeTagParameters(tag: IManifestTag): IAntlersParameter[] {
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
            name: thisParam.name,
        });
    }

    return parameters;
}

function getRuntimeModifierParameters(modifier: IManifestModifier): IModifierParameter[] {
    const parameters: IModifierParameter[] = [];

    for (let i = 0; i < modifier.parameters.length; i++) {
        const parsedParam = modifier.parameters[i];

        parameters.push({
            description: parsedParam.description,
            name: parsedParam.name,
        });
    }

    return parameters;
}

class ManifestManager {
    private loadedManifest: IAntlersManifest | null = null;

    public static instance: ManifestManager | null = null;

    hasManifest() {
        return this.loadedManifest != null;
    }

    getManifest(): IAntlersManifest | null {
        return this.loadedManifest;
    }

    load(manifest: IAntlersManifest | null) {
        if (manifest == null) {
            return;
        }

        TagManager.instance?.reset();
        ModifierManager.instance?.reset();

        for (let i = 0; i < manifest.tags.length; i++) {
            TagManager.instance?.registerTag({
                allowsArbitraryParameters: true,
                allowsContentClose: true,
                hideFromCompletions: !manifest.tags[i].showInCompletions,
                injectParentScope: false,
                parameters: getRuntimeTagParameters(manifest.tags[i]),
                requiresClose: false,
                tagName: manifest.tags[i].compound,
            });
        }

        ViewModelManager.instance?.reset();
        AugmentationManager.instance?.reset();
        ModifierManager.instance?.loadCoreModifiers();

        AugmentationManager.instance?.registerAugmentations(manifest.augmentContributions);
        ViewModelManager.instance?.registerViewModels(manifest.viewModels);

        for (let i = 0; i < manifest.modifiers.length; i++) {
            const manifestModifier = manifest.modifiers[i];

            let newAcceptedTypes = manifestModifier.expectsTypes,
                newReturnTypes = manifestModifier.returnsTypes;

            if (newAcceptedTypes == null || newAcceptedTypes.length == 0) {
                newAcceptedTypes = ["*"];
            }

            if (newReturnTypes == null || newReturnTypes.length == 0) {
                newReturnTypes = ["*"];
            }

            ModifierManager.instance?.registerModifier({
                acceptsType: newAcceptedTypes,
                canBeParameter: true,
                description: manifestModifier.description,
                docLink: "",
                name: manifestModifier.name,
                returnsType: newReturnTypes,
                parameters: getRuntimeModifierParameters(manifestModifier),
            });
        }

        for (let p = 0; p < manifest.packageManifests.length; p++) {
            for (let i = 0; i < manifest.packageManifests[p].tags.length; i++) {
                TagManager.instance?.registerTag({
                    allowsArbitraryParameters: true,
                    allowsContentClose: true,
                    hideFromCompletions:
                        !manifest.packageManifests[p].tags[i].showInCompletions,
                    injectParentScope: false,
                    parameters: getRuntimeTagParameters(
                        manifest.packageManifests[p].tags[i]
                    ),
                    requiresClose: false,
                    tagName: manifest.packageManifests[p].tags[i].compound,
                });
            }

            for (let i = 0; i < manifest.modifiers.length; i++) {
                const manifestModifier =
                    manifest.packageManifests[p].modifiers[i];

                let newAcceptedTypes = manifestModifier.expectsTypes,
                    newReturnTypes = manifestModifier.returnsTypes;

                if (newAcceptedTypes == null || newAcceptedTypes.length == 0) {
                    newAcceptedTypes = ["*"];
                }

                if (newReturnTypes == null || newReturnTypes.length == 0) {
                    newReturnTypes = ["*"];
                }

                ModifierManager.instance?.registerModifier({
                    acceptsType: newAcceptedTypes,
                    canBeParameter: true,
                    description: manifestModifier.description,
                    docLink: "",
                    name: manifestModifier.name,
                    returnsType: newReturnTypes,
                    parameters: getRuntimeModifierParameters(manifestModifier),
                });
            }
        }

        this.loadedManifest = manifest;
    }
}

if (typeof ManifestManager.instance == 'undefined' || ManifestManager.instance == null) {
    ManifestManager.instance = new ManifestManager();
}

export default ManifestManager;
