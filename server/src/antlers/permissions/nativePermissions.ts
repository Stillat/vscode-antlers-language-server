import { IUserPermission } from './permissionManager';

const NativePermissions: IUserPermission[] = [
	{ handle: 'access cp' },
	{ handle: 'configure collections' },
	{ handle: '[view edit create delete publish reorder] {collection} entries' },
	{ handle: 'configure structures' },
	{ handle: '[view edit] {structure} structure' },
	{ handle: 'edit {global} globals' },
	{ handle: '[view upload edit move rename delete] {container} assets' },
	{ handle: '[view perform] updates' },
	{ handle: '[view edit create delete] users' },
	{ handle: 'change passwords' },
	{ handle: 'edit roles' },
	{ handle: 'configure forms' },
	{ handle: '[view delete] {form} submissions' }
];

export { NativePermissions };
