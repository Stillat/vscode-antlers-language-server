import { IBlueprintField } from '../blueprints/fields';

export interface IForm {
    title: string;
    fields: Map<string, IBlueprintField[]>;
}
