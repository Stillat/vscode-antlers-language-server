import { IBlueprintField } from '../../projects/blueprints/fields';
import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IScopeVariable } from './types';


export function blueprintFieldToScopeVariable(symbol: AntlersNode, field: IBlueprintField): IScopeVariable {
    return {
        sourceName: field.blueprintName,
        dataType: field.type,
        name: field.name,
        sourceField: field,
        introducedBy: symbol
    };
}

export function valuesToDataMap(variables: IScopeVariable[]): Map<string, IScopeVariable> {
    const mapToReturn: Map<string, IScopeVariable> = new Map();

    for (let i = 0; i < variables.length; i++) {
        mapToReturn.set(variables[i].name, variables[i]);
    }

    return mapToReturn;
}

export function blueprintFieldsToScopeVariables(symbol: AntlersNode, blueprintFields: IBlueprintField[]): IScopeVariable[] {
    const variables: IScopeVariable[] = [];

    for (let i = 0; i < blueprintFields.length; i++) {
        const field = blueprintFields[i];

        variables.push({
            sourceName: field.blueprintName,
            dataType: field.type,
            name: field.name,
            sourceField: field,
            introducedBy: symbol
        });
    }

    return variables;
}