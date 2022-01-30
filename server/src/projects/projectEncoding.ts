import { IStatamicStructure } from './statamicStructure';

export class ProjectEncoder {
    static encode(structure: IStatamicStructure): string {
        return JSON.stringify(structure, (key, value) => {
            if (value instanceof Map) {
                return {
                    dataType: 'Map',
                    value: Array.from(value.entries()), // or with spread: value: [...value]
                };
            } else {
                return value;
            }
        });
    }

    static decode(data: string): IStatamicStructure {
        const tStruct = JSON.parse(data, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (value.dataType === 'Map') {
                    return new Map(value.value);
                }
            }
            return value;
        });

        return tStruct as IStatamicStructure;
    }
}