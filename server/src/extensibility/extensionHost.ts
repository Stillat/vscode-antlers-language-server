import { ExtensionContext } from './extensionContext';

export class ExtensionHost {

	private engineVersion = 1;
	private extensionPath = '';
	private packageDetails: any = {};
	private extensionName = '';

	constructor(extensionPath: string, engineVersion: number, packageDetails: any) {
		this.extensionPath = extensionPath;
		this.engineVersion = engineVersion;
		this.packageDetails = packageDetails;

		if (typeof this.packageDetails.name !== 'undefined') {
			this.extensionName = this.packageDetails.name as string;
		}
	}

	boot(context: ExtensionContext) {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const extension = require(this.extensionPath + '.js');

		if (typeof extension.activate === 'function') {
			const funcRef = extension.activate;
			funcRef.bind(this);


			setTimeout(() => {
				funcRef(context);

			}, 1000);
		}
	}

	getExtensionName(): string {
		return this.extensionName;
	}

	getTargetEngineVersion(): number {
		return this.engineVersion;
	}


}
