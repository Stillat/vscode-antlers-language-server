import { Faker } from '../../documentation/generator/faker';
import { IFieldDetails, IParsedBlueprint } from './types';

export class EnsureFields {
    static ensureCollectionFields(blueprint: IParsedBlueprint) {
        this.ensureFieldPrepended(Faker.textField('title', 'The entry\'s title'), blueprint);
        this.ensureField(Faker.slugField('slug', 'The entry\'s slug'), blueprint);
        this.ensureField(Faker.dateField('date', 'The date the entry was created'), blueprint);
    }

    static ensureNavigationFields(blueprint: IParsedBlueprint) {
        this.ensureField(Faker.textField('title', 'The navigation\'s title'), blueprint);
        this.ensureField(Faker.textField('url', 'The navigation\'s URL'), blueprint);
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