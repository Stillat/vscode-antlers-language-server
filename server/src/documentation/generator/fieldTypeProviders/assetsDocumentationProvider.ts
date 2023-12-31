import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver.js';
import { IAssetsFieldType, IParsedBlueprint, IProjectFields } from '../../../projects/structuredFieldTypes/types.js';
import { AugmentationTypes } from '../augmentationTypes.js';
import { Faker } from '../faker.js';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider.js';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider.js';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet, IInjectedField } from '../types.js';
import { GeneralQueryBuilderDocumentationProvider } from './generalQueryBuilderDocumentationProvider.js';

const AssetInjections: IInjectedField[] = [
    Faker.injectedTextField('id', 'The asset\'s ID'),
    Faker.injectedTextField('title', 'The asset\'s title'),
    Faker.injectedTextField('path', 'The relative asset path'),
    Faker.injectedTextField('filename', 'The asset\'s file name, without the extension'),
    Faker.injectedTextField('basename', 'The asset\'s file name, with the extension'),
    Faker.injectedTextField('extension', 'The extension of the asset'),
    Faker.injectedBoolField('is_asset', ''),
    Faker.injectedBoolField('is_audio', ''),
    Faker.injectedBoolField('is_previewable', ''),
    Faker.injectedBoolField('is_image', ''),
    Faker.injectedBoolField('is_video', ''),
    Faker.injectedArrayField('blueprint', ''),
    Faker.injectedTextField('edit_url', ''),
    Faker.injectedArrayField('container', ''),
    Faker.injectedTextField('folder', ''),
    Faker.injectedTextField('url', ''),
    Faker.injectedTextField('permalink', ''),
    Faker.injectedTextField('size', ''),
    Faker.injectedFloatField('size_bytes', ''),
    Faker.injectedFloatField('size_kilobytes', ''),
    Faker.injectedFloatField('size_megabytes', ''),
    Faker.injectedFloatField('size_gigabytes', ''),
    Faker.injectedFloatField('size_b', ''),
    Faker.injectedFloatField('size_kb', ''),
    Faker.injectedFloatField('size_mb', ''),
    Faker.injectedFloatField('size_gb', ''),
    Faker.injectedDateField('last_modified', ''),
    Faker.injectedFloatField('last_modified_timestamp', ''),
    Faker.injectedDateField('last_modified_instance', ''),
    Faker.injectedTextField('focus', ''),
    Faker.injectedBoolField('has_focus', ''),
    Faker.injectedTextField('focus_css', ''),
    Faker.injectedFloatField('height', ''),
    Faker.injectedFloatField('width', ''),
    Faker.injectedTextField('orientation', ''),
    Faker.injectedFloatField('ratio', ''),
    Faker.injectedTextField('mime_type', ''),
    Faker.injectedFloatField('duration', ''),
    Faker.injectedFloatField('duration_seconds', ''),
    Faker.injectedFloatField('duration_sec', ''),
    Faker.injectedTextField('playtime', ''),
]

export class AssetsDocumentationProvider implements IDocumentationProvider {
    resolve(context: IAssetsFieldType, currentProject: IProjectFields): IDocumentationResult {
        if (context.maxFiles !== 1) {
            return (new GeneralQueryBuilderDocumentationProvider()).resolve(context, currentProject);
        }

        let assetBlueprint: IParsedBlueprint | null = null;

        for (let i = 0; i < currentProject.assets.length; i++) {
            if (currentProject.assets[i].handle == context.container) {
                assetBlueprint = currentProject.assets[i];
                break;
            }
        }

        let injectedFields: IInjectedField[] = KeysResolver.fieldsToInjectedFields(assetBlueprint?.allFields ?? [])

        injectedFields = injectedFields.concat(AssetInjections);

        const docLink = OfficialDocumentationLinkProvider.getDocLink(context.type),
            overviewProperties: IDocumentationProperty[] = [],
            overviewSnippets: IDocumentationSnippet[] = NestedFieldsProvider.generate(context.handle, injectedFields);

        return {
            resolved: true,
            documentation: {
                handle: context.type,
                field: context,
                injects: injectedFields,
                stringable: true,
                rawReturns: AugmentationTypes.Asset,
                augmentsTo: AugmentationTypes.Asset,
                canBeTagPair: true,
                exampleSnippets: [],
                overviewSnippets: overviewSnippets,
                officialDocumentation: docLink,
                overviewProperties: overviewProperties,
                stringableReturns: "The asset's path",
                modifiers: []
            }
        };
    }
}