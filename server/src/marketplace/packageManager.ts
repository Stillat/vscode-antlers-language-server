import { IMarketplaceAddon } from './marketplaceTypes.js';
import { KnownPackages } from './packageRegistry.js';

class PackageManager {
    public static instance: PackageManager | null = null;

    private knownPackages: Map<string, IMarketplaceAddon> = new Map();

    loadPackages() {
        if (this.knownPackages.entries.length > 0) {
            return;
        }

        KnownPackages.forEach((statamicPackage) => {
            this.knownPackages.set(statamicPackage.packageName, statamicPackage);
        });
    }

    hasPackage(name: string): boolean {
        return this.knownPackages.has(name);
    }

    getPackage(name: string): IMarketplaceAddon {
        return this.knownPackages.get(name) as IMarketplaceAddon;
    }
}

if (typeof PackageManager.instance == 'undefined' || PackageManager.instance == null) {
    PackageManager.instance = new PackageManager();
}

export default PackageManager;
