import { IFieldtypeInjection } from "../../projects/fieldsets/fieldtypeInjection.js";
import CoreFieldtypes from "./core/coreFieldtypes.js";

class FieldtypeManager {
    private fieldTypes: Map<string, IFieldtypeInjection> = new Map();

    public static instance: FieldtypeManager | null = null;

    getFieldTypes(): Map<string, IFieldtypeInjection> {
        return this.fieldTypes;
    }

    getFieldType(name: string): IFieldtypeInjection | undefined | null {
        return this.fieldTypes.get(name);
    }

    registerFieldtypes(types: IFieldtypeInjection[]) {
        for (let i = 0; i < types.length; i++) {
            this.fieldTypes.set(types[i].name, types[i]);
        }
    }

    loadCoreFieldtypes() {
        this.registerFieldtypes(CoreFieldtypes);
    }

    hasFieldtype(name: string): boolean {
        return this.fieldTypes.has(name);
    }
}

if (
    typeof FieldtypeManager.instance == "undefined" ||
    FieldtypeManager.instance == null
) {
    FieldtypeManager.instance = new FieldtypeManager();
    FieldtypeManager.instance.loadCoreFieldtypes();
}

export default FieldtypeManager;
