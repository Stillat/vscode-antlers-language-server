import { trimLeft } from "../utils/strings";
import { IBlueprintField } from './blueprints/fields';
import { IManifestViewModel } from './manifest/manifestTypes';

class ViewModelManager {
    private viewModels: Map<string, IManifestViewModel> = new Map();

    public static instance: ViewModelManager | null = null;

    reset() {
        this.viewModels.clear();
    }

    registerViewModel(viewModel: IManifestViewModel) {
        this.viewModels.set(viewModel.fqn, viewModel);
    }

    registerViewModels(viewModels: IManifestViewModel[]) {
        for (let i = 0; i < viewModels.length; i++) {
            this.registerViewModel(viewModels[i]);
        }
    }

    hasViewModel(qualifiedName: string): boolean {
        const checkName = trimLeft(qualifiedName, "\\");

        return this.viewModels.has(checkName);
    }

    getViewModelFields(qualifiedName: string): IBlueprintField[] {
        let checkName = qualifiedName;

        if (checkName.startsWith("\\")) {
            checkName = checkName.substr(1);
        }

        checkName = checkName.replace("\\\\", "\\");

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
                type: "*",
            });
        }

        return fields;
    }
}

if (typeof ViewModelManager.instance == 'undefined' || ViewModelManager.instance == null) {
    ViewModelManager.instance = new ViewModelManager();
}

export default ViewModelManager;
