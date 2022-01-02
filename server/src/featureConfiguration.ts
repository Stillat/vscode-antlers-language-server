/**
 * This file contains global feature flags and configuration.
 *
 * Behavior controlled by this file is generally:
 *
 *   * Experimental, and may be removed in a future build
 *   * Is scheduled to be removed completely, but can be reverted quickly
 */

export interface IFeatureConfiguration {
    warnUnknownParameters: boolean;
}

const GlobalFeatureConfiguration: IFeatureConfiguration = {
    warnUnknownParameters: false,
};

export { GlobalFeatureConfiguration };
