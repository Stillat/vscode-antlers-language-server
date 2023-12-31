import { IStructure } from '../structures/structure.js';

export interface ICollection {
    handle: string;
    title: string;
    template: string;
    layout: string;
    isStructure: boolean;
    taxonomies: string[];
    structure: IStructure | null;
    viewModel: string | null;
    injectFields: string[];
}
