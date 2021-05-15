import * as fs from 'fs';
import * as semver from 'semver';
import { trimLeft, trimRight } from '../utils/strings';

export interface IComposerPackage {
	/**
	 * The name of the Composer package.
	 */
	name: string,
	/**
	 * The installed version of the Composer package (from composer.lock).
	 */
	version: string,
	/**
	 * The path on disk to the composer.json (accounts for path repository types).
	 */
	vendorPath: string,
	/**
	 * Indicates if the Composer package is a Statamic addon.
	 */
	isStatamicAddon: boolean,
	/**
	 * Additional details about possible Antlers language server extensions, if any.
	 */
	antlersExtension: IAntlersExtension | null
}

export interface IAntlersExtension {
	/**
	 * The path to the tags.json file, if any.
	 */
	tagsFile: string | null,
	/**
	 * The path to the modifiers.json file, if any.
	 */
	modifiersFile: string | null,
	/**
	 * The path to the types.json file, if any.
	 */
	fieldtypesFile: string | null,
}

function isStatamicAddon(composerJsonPath: string): boolean {

	const packageDetails = JSON.parse(fs.readFileSync(composerJsonPath, { encoding: 'utf8' }));

	if (typeof packageDetails.extra !== 'undefined' && typeof packageDetails.extra.statamic !== 'undefined') {
		return true;
	}

	return false;
}

export class LockFileParser {

	static getInstalledPackages(lockFilePath: string, laravelRoot: string, composerVendorDirectory: string): IComposerPackage[] {
		const packages: IComposerPackage[] = [];

		if (fs.existsSync(lockFilePath)) {
			const lockContents = JSON.parse(fs.readFileSync(lockFilePath, { encoding: 'utf8' }));

			if (typeof lockContents !== 'undefined' && typeof lockContents.packages !== 'undefined') {
				for (let i = 0; i < lockContents.packages.length; i++) {
					const thisPackage = lockContents.packages[i];

					if (typeof thisPackage.name !== 'undefined' && typeof thisPackage.version !== 'undefined') {
						let composerPath = composerVendorDirectory + trimRight(thisPackage.name, '/') + '/composer.json',
							antlersExtensionDirectory = composerVendorDirectory + trimRight(thisPackage.name, '/') + '/.antlers-ls/',
							isAddon = false;

						if (typeof thisPackage.dist !== 'undefined') {
							const distInfo = thisPackage.dist;

							if (typeof distInfo.type !== 'undefined' && typeof distInfo.url !== 'undefined') {
								if (distInfo.type === 'path') {
									composerPath = laravelRoot + trimRight(thisPackage.dist.url, '/') + '/composer.json',
										antlersExtensionDirectory = composerVendorDirectory + trimRight(thisPackage.name, '/') + '/.antlers-ls/';
								}
							}
						}

						let antlersExtension: IAntlersExtension | null = null;

						if (fs.existsSync(composerPath)) {
							isAddon = isStatamicAddon(composerPath);

							if (isAddon) {
								if (fs.existsSync(antlersExtensionDirectory)) {
									antlersExtension = {
										fieldtypesFile: null,
										modifiersFile: null,
										tagsFile: null
									};

									const tagsPath = antlersExtensionDirectory + 'tags.json',
										modifiersPath = antlersExtensionDirectory + 'modifiers.json',
										fieldTypesPath = antlersExtensionDirectory + 'types.json';

									if (fs.existsSync(tagsPath)) {
										antlersExtension.tagsFile = tagsPath;
									}

									if (fs.existsSync(modifiersPath)) {
										antlersExtension.modifiersFile = modifiersPath;
									}

									if (fs.existsSync(fieldTypesPath)) {
										antlersExtension.fieldtypesFile = fieldTypesPath;
									}
								}
							}
						}

						let version = trimLeft(thisPackage.version, 'v');
						const cleanedVersion = semver.clean(version);

						if (cleanedVersion != null) {
							version = cleanedVersion;
						}

						packages.push({
							name: thisPackage.name,
							version: version,
							vendorPath: composerPath,
							isStatamicAddon: isAddon,
							antlersExtension: antlersExtension
						});
					}
				}
			}
		}

		return packages;
	}

}
