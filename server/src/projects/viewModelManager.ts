import { trimLeft } from '../utils/strings';
import { IBlueprintField } from './blueprints';
import { IManifestViewModel } from './manifestManager';

export class ViewModelManager {
	static viewModels: Map<string, IManifestViewModel> = new Map();

	static reset() {
		this.viewModels.clear();
	}

	static registerViewModel(viewModel: IManifestViewModel) {
		this.viewModels.set(viewModel.fqn, viewModel);
	}

	static registerViewModels(viewModels: IManifestViewModel[]) {
		for (let i = 0; i < viewModels.length; i++) {
			this.registerViewModel(viewModels[i]);
		}
	}

	static hasViewModel(qualifiedName: string): boolean {
		const checkName = trimLeft(qualifiedName, '\\');

		return this.viewModels.has(checkName);
	}

	static getViewModelFields(qualifiedName: string): IBlueprintField[] {
		let checkName = qualifiedName;

		if (checkName.startsWith('\\')) {
			checkName = checkName.substr(1);
		}

		checkName = checkName.replace('\\\\', '\\');

		if (this.viewModels.has(checkName) == false) {
			return [];
		}

		const fields: IBlueprintField[] = [],
			viewModel = this.viewModels.get(checkName) as IManifestViewModel;

		for (let i = 0; i < viewModel.fields.length; i++) {
			fields.push({
				blueprintName: checkName,
				displayName: viewModel.fields[i],
				import: null,
				instructionText: null,
				maxItems: null,
				name: viewModel.fields[i],
				refFieldSetField: null,
				sets: null,
				type: '*'
			});
		}

		return fields;
	}

}
