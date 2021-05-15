import * as semver from 'semver';

export class Version {

	/**
	 * Tests if a version is within the provided range.
	 * 
	 * @param {string} version The version to check.
	 * @param {string} range The accepted version ranges.
	 * @returns 
	 */
	satisfies(version: string, range: string): boolean {
		return semver.satisfies(version, range);
	}

	/**
	 * Tests if a version string is greater or equal to another.
	 * 
	 * @param {string} version The version to test.
	 * @param {string} compareTo The version to test against.
	 * @returns 
	 */
	gte(version: string, compareTo: string): boolean {
		return semver.gte(version, compareTo);
	}

	/**
	 * Tests if a version string is less than or equal to another.
	 * 
	 * @param {string} version The version to test.
	 * @param {string} compareTo The version to test against.
	 * @returns 
	 */
	lte(version: string, compareTo: string): boolean {
		return semver.lte(version, compareTo);
	}

	/**
	 * Tests if a version string is greater than another.
	 * 
	 * @param {string} version The version to test.
	 * @param {string} compareTo The version to test against.
	 * @returns 
	 */
	lt(version: string, compareTo: string): boolean {
		return semver.lt(version, compareTo);
	}

	/**
	 * Tests if a version string is less than another.
	 * 
	 * @param {string} version The version to test.
	 * @param {string} compareTo The version to test against.
	 * @returns 
	 */
	gt(version: string, compareTo: string): boolean {
		return this.gt(version, compareTo);
	}

}
