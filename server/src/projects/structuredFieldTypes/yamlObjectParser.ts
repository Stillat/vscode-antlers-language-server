import * as yaml from 'yaml';
import { Faker } from '../../documentation/generator/faker';
import { IFieldDetails } from './types';

export class ParsedYamlObject {
    public varName: string = '';
    public fields: IFieldDetails[] = [];
}

export class DynamicYamlFieldsParser {

    parse(document: string): IFieldDetails[] {
        const parsedDocument = yaml.parse(document),
            root = this.parseObject('root', parsedDocument);

        return root.fields;
    }

    private parseObject(varName: string, context: any): ParsedYamlObject {
        const parsedObject: ParsedYamlObject = new ParsedYamlObject(),
            rootVariables = Object.keys(context),
            objectVars: Map<string, ParsedYamlObject> = new Map();

        parsedObject.varName = varName;

        rootVariables.forEach((rootVariable) => {
            const tempVar = context[rootVariable];
            const varType = typeof tempVar;
            if (varType === 'string') {
                parsedObject.fields.push(Faker.textField(rootVariable));
            } else if (varType === 'number') {
                parsedObject.fields.push(Faker.floatField(rootVariable));
            } else if (varType === 'boolean') {
                parsedObject.fields.push(Faker.boolField(rootVariable));
            } else if (varType === 'object' && Array.isArray(tempVar)) {
                parsedObject.fields.push(Faker.arrayField(rootVariable));
            } else {
                objectVars.set(rootVariable, this.parseObject(rootVariable, tempVar));
            }
        });

        if (objectVars.size > 0) {
            objectVars.forEach((value, key) => {
                const keyedArray = Faker.arrayField(key);
                keyedArray.mode = 'keyed';
                keyedArray.fields = value.fields;

                parsedObject.fields.push(keyedArray);
            });
        }

        return parsedObject;
    }
}
