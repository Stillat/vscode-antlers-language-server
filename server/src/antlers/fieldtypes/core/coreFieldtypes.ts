import { IFieldtypeInjection } from '../fieldtypeManager';
import ArrayFieldType from './arrayFieldType';
import BardFieldType from './bardFieldType';
import FormMultipleFieldtype from './formMultiple';
import ListFieldtype from './listFieldType';
import ReplicatorFieldtype from './replicatorFieldType';
import SelectMultipleFieldtype from './selectMultiple';
import SitesMultiple from './sitesMultiple';
import StructuresMultipleFieldtype from './structuresMultiple';
import TableFieldtype from './table';
import TagsFieldtype from './tagsFieldType';
import TaxonomiesMultipleFieldtype from './taxonomiesMultiple';
import TermsMultipleFieldtype from './termsMultiple';
import UserGroupsMultipleFieldtype from './userGroupsMultiple';
import UserRolesMultipleFieldtype from './userRolesMultiple';
import UsersMultipleFieldtype from './usersMultiple';
import YamlFieldtype from './yamlFieldType';

const CoreFieldtypes: IFieldtypeInjection[] = [
	ArrayFieldType,
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
