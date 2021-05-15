import { IBlueprintField } from './blueprints';
import { IContributedField, IManifestAugmentationContribution } from './manifestManager';

export class AugmentationManager {
	static blueprintAugmentations: Map<string, IManifestAugmentationContribution[]> = new Map();
	static collectionAugmentations: Map<string, IManifestAugmentationContribution[]> = new Map();

	static reset() {
		this.blueprintAugmentations.clear();
		this.collectionAugmentations.clear();
	}

	static registerAugmentation(augmentation: IManifestAugmentationContribution) {
		for (let i = 0; i < augmentation.collections.length; i++) {
			if (this.collectionAugmentations.has(augmentation.collections[i]) == false) {
				this.collectionAugmentations.set(augmentation.collections[i], []);
			}

			this.collectionAugmentations.get(augmentation.collections[i])?.push(augmentation);
		}

		for (let i = 0; i < augmentation.blueprints.length; i++) {
			if (this.blueprintAugmentations.has(augmentation.blueprints[i]) == false) {
				this.blueprintAugmentations.set(augmentation.blueprints[i], []);
			}

			this.blueprintAugmentations.get(augmentation.blueprints[i])?.push(augmentation);
		}
	}

	static registerAugmentations(augmentations: IManifestAugmentationContribution[]) {
		for (let i = 0; i < augmentations.length; i++) {
			this.registerAugmentation(augmentations[i]);
		}
	}

	private static getType(types: string[]): string {
		if (types.length == 0) {
			return '*';
		}

		return types[0];
	}

	static makeFields(contributions: IManifestAugmentationContribution[]): IBlueprintField[] {
		const fields: IBlueprintField[] = [];

		for (let i = 0; i < contributions.length; i++) {
			const thisContribution = contributions[i];

			for (let j = 0; j < thisContribution.fields.length; j++) {
				const thisField = thisContribution.fields[j];

				fields.push(this.makeField(thisContribution.name, thisField));
			}
		}

		return fields;
	}

	static makeField(name: string, field: IContributedField): IBlueprintField {
		return {
			blueprintName: name,
			displayName: field.name,
			instructionText: field.description,
			import: null,
			maxItems: null,
			name: field.name,
			refFieldSetField: null,
			sets: null,
			type: this.getType(field.returnTypes)
		};
	}

	static getCollectionFields(collectionName: string): IBlueprintField[] {
		if (this.collectionAugmentations.has(collectionName) == false) {
			return [];
		}

		const contributions = this.collectionAugmentations.get(collectionName) as IManifestAugmentationContribution[];

		return this.makeFields(contributions);
	}

}
