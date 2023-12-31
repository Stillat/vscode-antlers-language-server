import { EmptyDocumentationResult, IDocumentationModifier, IDocumentationProvider, IDocumentationResult, IFieldtypeDocumentationOverview } from './types.js';
import * as providers from './fieldTypeProviders/providers.js';
import ModifierManager from './../../antlers/modifierManager.js';
import { IModifier } from '../../antlers/modifierTypes.js';
import { StringUtilities } from '../../runtime/utilities/stringUtilities.js';
import { AugmentationTypes } from './augmentationTypes.js';
import { IProjectFields } from '../../projects/structuredFieldTypes/types.js';

let currentDetails: IProjectFields | null = null;

export function updateCurrentDetails(details: IProjectFields) {
    currentDetails = details;
}

export class DocumentationProvider {
    private providers: Map<string, IDocumentationProvider> = new Map();

    constructor() {
        this.providers.set('array', new providers.ArrayDocumentationProvider());
        this.providers.set('assets', new providers.AssetsDocumentationProvider());
        this.providers.set('bard', new providers.BardDocumentationProvider());
        this.providers.set('button_group', new providers.ButtonGroupDocumentationProvider());
        this.providers.set('checkboxes', new providers.CheckboxesDocumentationProvider());
        this.providers.set('code', new providers.CodeDocumentationProvider());
        this.providers.set('collections', new providers.CollectionsDocumentationProvider());
        this.providers.set('color', new providers.ColorDocumentationProvider());
        this.providers.set('date', new providers.DateDocumentationProvider());
        this.providers.set('entries', new providers.EntriesDocumentationProvider());
        this.providers.set('float', new providers.FloatDocumentationProvider());
        this.providers.set('form', new providers.FormDocumentationProvider());
        this.providers.set('grid', new providers.GridDocumentationProvider());
        this.providers.set('integer', new providers.IntegerDocumentationProvider());
        this.providers.set('link', new providers.LinkDocumentationProvider());
        this.providers.set('list', new providers.ListDocumentationProvider());
        this.providers.set('markdown', new providers.MarkdownDocumentationProvider());
        this.providers.set('radio', new providers.RadioDocumentationProvider());
        this.providers.set('range', new providers.RangeDocumentationProvider());
        this.providers.set('replicator', new providers.ReplicatorDocumentationProvider());
        this.providers.set('select', new providers.SelectDocumentationProvider());
        this.providers.set('sites', new providers.SitesDocumentationProvider());
        this.providers.set('slug', new providers.SlugDocumentationProvider());
        this.providers.set('structures', new providers.StructuresDocumentationProvider());
        this.providers.set('table', new providers.TableDocumentationProvider());
        this.providers.set('taggable', new providers.TaggableDocumentationProvider());
        this.providers.set('taxonomies', new providers.TaxonomiesDocumentationProvider());
        this.providers.set('template', new providers.TemplateDocumentationProvider());
        this.providers.set('terms', new providers.TermsDocumentationProvider());
        this.providers.set('text', new providers.TextDocumentationProvider());
        this.providers.set('textarea', new providers.TextAreaDocumentationProvider());
        this.providers.set('time', new providers.TimeDocumentationProvider());
        this.providers.set('toggle', new providers.ToggleDocumentationProvider());
        this.providers.set('user_groups', new providers.UserGroupsDocumentationProvider());
        this.providers.set('user_roles', new providers.UserRolesDocumentationProvider());
        this.providers.set('users', new providers.UsersDocumentationProvider());
        this.providers.set('video', new providers.VideoDocumentationProvider());
    }

    private massageAugmentType(type: string): string {
        if (type == AugmentationTypes.Builder) {
            return 'array';
        } else if (type == 'asset') {
            return 'assets';
        }

        return type;
    }

    private getDocumentationModifiers(docs: IFieldtypeDocumentationOverview): IDocumentationModifier[] {
        const modifiers: IDocumentationModifier[] = [];

        const coreModifiers = ModifierManager.instance?.getModifiersForType(this.massageAugmentType(docs.augmentsTo)),
            addedModifiers: string[] = [],
            filteredModiifers: IModifier[] = [];

        coreModifiers?.forEach((modifier) => {
            if (modifier.isDeprecated) { return; }

            if (modifier.forFieldType.length > 0 && !modifier.forFieldType.includes(docs.field.type)) { return; }

            if (docs.augmentsTo == 'asset' || docs.augmentsTo == 'entry') {
                if (modifier.acceptsType.length == 1 && modifier.acceptsType[0] == 'array') {
                    return;
                }
            }

            filteredModiifers.push(modifier);
            addedModifiers.push(modifier.name);
        });

        if (docs.augmentsTo == 'asset') {
            ModifierManager.instance?.getRegisteredModifiers().forEach((modifier) => {
                if (modifier.forFieldType.includes('assets') && !addedModifiers.includes(modifier.name)) {
                    filteredModiifers.push(modifier);
                    addedModifiers.push(modifier.name);
                }
            });
        }

        filteredModiifers.forEach((modifier) => {
            modifiers.push({
                acceptsTypes: modifier.acceptsType,
                description: modifier.description,
                docLink: modifier.docLink,
                name: modifier.name,
                returnsTypes: modifier.returnsType,
                parameters: modifier.parameters
            });
        });

        return modifiers;
    }

    getDocumentation(context: any): IDocumentationResult {
        if (typeof context['type'] !== 'string') {
            return EmptyDocumentationResult;
        }

        const fieldType = (context['type'] as string).toLowerCase();

        if (!this.providers.has(fieldType)) { return EmptyDocumentationResult; }

        const resolvedDocs = (this.providers.get(fieldType) as IDocumentationProvider).resolve(context, currentDetails);

        if (resolvedDocs.resolved == false) {
            return resolvedDocs;
        }

        if (resolvedDocs.documentation != null) {
            resolvedDocs.documentation.overviewProperties.unshift({
                name: 'Type',
                value: fieldType,
                mono: true
            })

            resolvedDocs.documentation.overviewProperties.push({
                name: 'Stringable',
                value: StringUtilities.boolLabel(resolvedDocs.documentation.stringable),
                mono: false
            });

            resolvedDocs.documentation.overviewProperties.push({
                name: 'Arrayable',
                value: StringUtilities.boolLabel(resolvedDocs.documentation.canBeTagPair),
                mono: false
            });

            resolvedDocs.documentation.overviewProperties.push({
                name: 'Augments To',
                value: resolvedDocs.documentation.augmentsTo,
                mono: true
            });

            resolvedDocs.documentation.modifiers = this.getDocumentationModifiers(resolvedDocs.documentation);
        }

        return resolvedDocs;
    }
}