import { Faker } from '../../documentation/generator/faker';
import { IFieldDetails, IParsedBlueprint } from './types';

export class EnsureFields {
    static ensureCollectionFields(blueprint: IParsedBlueprint) {
        this.ensureFieldPrepended(Faker.textField('title'), blueprint);
        this.ensureField(Faker.slugField('slug'), blueprint);
        this.ensureField(Faker.dateField('date'), blueprint);
    }

    static ensureNavigationFields(blueprint: IParsedBlueprint) {
        this.ensureField(Faker.textField('title'), blueprint);
        this.ensureField(Faker.textField('url'), blueprint);
    }

    static ensureFieldPrepended(field: IFieldDetails, blueprint: IParsedBlueprint) {
        if (!this.hasField(field.handle, blueprint)) {
            blueprint.allFields.unshift(field);
            if (blueprint.sections.length > 0) {
                blueprint.sections[0].fields.unshift(field);
            }
        }
    }

    static ensureField(field: IFieldDetails, blueprint: IParsedBlueprint) {
        if (!this.hasField(field.handle, blueprint)) {
            blueprint.allFields.push(field);
            if (blueprint.sections.length > 0) {
                blueprint.sections[0].fields.push(field);
            }
        }
    }

    static hasField(handle: string, blueprint: IParsedBlueprint): boolean {
        for (let i = 0; i < blueprint.allFields.length; i++) {
            if (blueprint.allFields[i].handle == handle) {
                return true;
            }
        }

        return false;
    }
}