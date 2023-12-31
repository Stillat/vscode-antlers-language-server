import { IFieldtypeInjection } from '../../../projects/fieldsets/fieldtypeInjection.js';
import ArrayFieldType from './arrayFieldType.js';
import AssetsFieldType from './assetsFieldType.js';
import BardFieldType from './bardFieldType.js';
import FormMultipleFieldtype from './formMultiple.js';
import ListFieldtype from './listFieldType.js';
import ReplicatorFieldtype from './replicatorFieldType.js';
import SelectMultipleFieldtype from './selectMultiple.js';
import SitesMultiple from './sitesMultiple.js';
import StructuresMultipleFieldtype from './structuresMultiple.js';
import TableFieldtype from './table.js';
import TagsFieldtype from './tagsFieldType.js';
import TaxonomiesMultipleFieldtype from './taxonomiesMultiple.js';
import TermsMultipleFieldtype from './termsMultiple.js';
import UserGroupsMultipleFieldtype from './userGroupsMultiple.js';
import UserRolesMultipleFieldtype from './userRolesMultiple.js';
import UsersMultipleFieldtype from './usersMultiple.js';
import YamlFieldtype from './yamlFieldType.js';

const CoreFieldtypes: IFieldtypeInjection[] = [
    ArrayFieldType,
    AssetsFieldType,
    BardFieldType,
    FormMultipleFieldtype,
    ListFieldtype,
    ReplicatorFieldtype,
    SelectMultipleFieldtype,
    SitesMultiple,
    StructuresMultipleFieldtype,
    YamlFieldtype,
    TableFieldtype,
    TaxonomiesMultipleFieldtype,
    TagsFieldtype,
    TermsMultipleFieldtype,
    UsersMultipleFieldtype,
    UserGroupsMultipleFieldtype,
    UserRolesMultipleFieldtype
];

export default CoreFieldtypes;
