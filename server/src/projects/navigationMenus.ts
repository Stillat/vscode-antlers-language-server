import * as path from 'path';
import * as fs from 'fs';
import * as YAML from 'yaml';

import { INavigation } from './statamicProject';

export function getNavigationMenu(navPath: string): INavigation {
	const navHandle = path.basename(navPath).split('.').slice(0, -1).join('.');
	let navTitle = navHandle;

	try {
		const contents = fs.readFileSync(navPath, { encoding: 'utf8' }),
			document = YAML.parse(contents);

		if (typeof document.title !== 'undefined' && document.title !== null) {
			navTitle = document.title;
		}

	} catch (err) {
		console.error(err);
	}

	return {
		handle: navHandle,
		title: navTitle
	};
}
