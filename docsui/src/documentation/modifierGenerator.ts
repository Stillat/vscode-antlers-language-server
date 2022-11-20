import type { IDocumentationModifier, IFieldtypeDocumentationOverview } from './types';

export class ModifierGenerator {
    static generateDocs(modifier: IDocumentationModifier, field: IFieldtypeDocumentationOverview, isBuilder: boolean): string {
        let paramString: string = '',
            modifierString: string = '';

        if (modifier.parameters.length > 0) {
            paramString = '(' + this.getParamString(modifier) + ')';
        }

        modifierString = modifier.name + paramString;

        if ((field.stringable || field.augmentsTo == 'string') && ['first', 'last', 'reverse'].includes(modifier.name)) {
            return `{{ ${field.field.handle} | ${modifierString} /}}`;
        }

        if ((field.augmentsTo == 'array' || field.augmentsTo == 'builder') && ['first', 'last', 'reverse'].includes(modifier.name)) {
            if (isBuilder) {
                return `{{ ${field.field.handle} | as('${field.field.handle}_alias') }}
                
    {{ ${field.field.handle}_alias | ${modifierString} }}

    {{ /${field.field.handle}_alias }}

{{ /${field.field.handle} }}`;
            } else {
                return `{{ ${field.field.handle} | ${modifierString} }}

{{ /${field.field.handle} }}`;
            }
        }

        if (modifier.returnsTypes.length == 1) {
            const returnType = modifier.returnsTypes[0];

            if (returnType == 'array') {
                if (isBuilder && modifier.name != 'as') {
                    return `{{ ${field.field.handle} | as('${field.field.handle}_alias') }}
                
    {{ ${field.field.handle}_alias | ${modifierString} }}

    {{ /${field.field.handle}_alias }}

{{ /${field.field.handle} }}`;
                } else {
                    return `{{ ${field.field.handle} | ${modifierString} }}

{{ /${field.field.handle} }}`;
                }
            } else if (returnType == 'boolean') {
                if (isBuilder) {
                    return `{{ if ({${field.field.handle}} | ${modifierString}) }}

{{ /if }}`;
                } else {
                    return `{{ if (${field.field.handle} | ${modifierString}) }}

{{ /if }}`;
                }
            } else if (returnType == 'string') {
                if (isBuilder) {
                    return `{{ {${field.field.handle}} | ${modifierString} /}}`;
                } else {
                    return `{{ ${field.field.handle} | ${modifierString} /}}`;
                }
            } else if (returnType == 'number') {
                if (isBuilder) {
                    return `{{ ${field.field.handle} | ${modifierString} /}}

{{# In a condition. #}}
{{ if ({${field.field.handle}} | ${modifierString}) > 0 }}

{{ /if }}`;
                } else {
                    return `{{ ${field.field.handle} | ${modifierString} /}}

{{# In a condition. #}}
{{ if (${field.field.handle} | ${modifierString}) > 0 }}

{{ /if }}`;
                }
            }
        }

        return '';
    }

    private static getParamString(modifier: IDocumentationModifier): string {
        const paramNames: string[] = [];

        modifier.parameters.forEach((param) => {
            paramNames.push(param.name);
        });

        return paramNames.join(', ');
    }
}