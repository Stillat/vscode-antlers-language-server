import { Faker } from '../../documentation/generator/faker';
import { IInjectedField } from '../../documentation/generator/types';
import { IFieldDetails } from './types';

export class KeysResolver {
    static getKeys(context: any): string[] {
        if (typeof context['keys'] === 'undefined') {
            return [];
        }

        const kVal = context['keys'];

        if (kVal === null) {
            return [];
        }

        return Object.keys(kVal);
    }

    static keysToInjectedField(fields: string[]): IInjectedField[] {
        const returnFields: IInjectedField[] = [];

        fields.forEach((field) => {
            returnFields.push(Faker.injectedTextField(field));
        });

        return returnFields;
    }

    private static massageInjectedType(type: string): string {
        if (type == 'user_roles' || type == 'user_groups') {
            return 'array';
        }

        return type;
    }

    static fieldsToInjectedFields(fields: IFieldDetails[]): IInjectedField[] {
        const returnFields: IInjectedField[] = [];

        fields.forEach((field) => {
            returnFields.push({
                name: field.handle,
                type: this.massageInjectedType(field.type),
                field: field
            });
        });

        return returnFields;
    }
}