import * as fs from 'fs';
import * as path from 'path';
import { normalizePath } from '../utils/io';
import {Md5} from 'ts-md5/dist/md5';
import { EventEmitter} from 'events';
import chokdar = require('chokidar');
import { resetTimings, setTimings, TimingInterface } from './antlersDebug';

export interface IRuntimeBreakpoint {
	id: number;
	line: number;
	verified: boolean;
	source: string;
}

export interface IRuntimeException {
	file: string,
	lc: number,
	ll: number,
	msg: string,
	rc: number,
	rl: number,
	type: string
}

export class RuntimeBridge extends EventEmitter {
	private _resourceRoot = '';
	private _debugRoot = '';
	private _antlersDirectory = '';
	private _antlersDebugDirectory = '';
	private _antlersDebugBreakpointRegistry = '';
	private _antlersDebugBreakpointLocks = '';
	private _antlersDebugKeepAliveFile = '';
	private _canBoot = false;
	private breakpointId = 1;
	private _activeLock = '';
	private _keepAliveInterval:NodeJS.Timeout|null = null;
	private registeredBreakpoints:Map<string, Map<number, IRuntimeBreakpoint>> = new Map();

	constructor(root: string, resourceRoot: string) {
		super();

		this._resourceRoot = resourceRoot;
		this._debugRoot = root;
		this._antlersDirectory = this._debugRoot + 'antlers/';
		this._antlersDebugDirectory = this._antlersDirectory + '_debug/';
		this._antlersDebugKeepAliveFile = this._antlersDebugDirectory + 'debug-session';
		this._antlersDebugBreakpointRegistry = this._antlersDebugDirectory + '_bpt/';
		this._antlersDebugBreakpointLocks = this._antlersDebugDirectory + '_bpt_l/';

		this._canBoot = this.prepareDebugEnvironment();
	}

	protected startKeepAlive() {
		this._keepAliveInterval = setInterval(function () {
			fs.writeFileSync(this._antlersDebugKeepAliveFile, (new Date()).valueOf().toString());
		}.bind(this), 2000);
	}

	protected shutdownKeepAlive() {
		if (this._keepAliveInterval) {
			clearInterval(this._keepAliveInterval);
		}
	}

	stopSession() {
		this.shutdownKeepAlive();
	}

	startSession() {
		this.startKeepAlive();
	}

	getAllBreakPoints(srcPath: string, line: number):IRuntimeBreakpoint[] {
		const relativePath = this.getRelativePath(srcPath),
			runtimeSlug = this.makeRuntimeSlug(relativePath);
		
		const allBreakpoints:IRuntimeBreakpoint[] = [];

		if (this.registeredBreakpoints.has(runtimeSlug)) {
			const srcBps = this.registeredBreakpoints.get(runtimeSlug) as Map<number, IRuntimeBreakpoint>;

			if (srcBps.has(line)) {
				allBreakpoints.push(srcBps.get(line));
			}
		}

		return allBreakpoints;
	}

	private getRelativePath(sPath: string) {
		return normalizePath(sPath).substr(this._resourceRoot.length + 1);
	}

	private makeRuntimeSlug(sPath: string): string {
		return Md5.hashStr(sPath.toLowerCase());
	}

	private setRuntimeBreakpoint(bpPath: string, line: number): string {
		const runtimeSlug = this.makeRuntimeSlug(bpPath),
			debugTarget = this._antlersDebugBreakpointRegistry + runtimeSlug + '/',
			bpTargetFile = debugTarget + line;

		if (!fs.existsSync(debugTarget)) {
			fs.mkdirSync(debugTarget);
		}

		fs.writeFileSync(bpTargetFile, JSON.stringify({
			path: bpPath,
			encode: runtimeSlug,
			line: line
		}));

		return runtimeSlug;
	}

	resetBreakPoints(bpPath: string) {
		const relativeTarget = this.getRelativePath(bpPath),
			runtimeSlug = this.makeRuntimeSlug(relativeTarget),
			debugTarget = this._antlersDebugBreakpointRegistry + runtimeSlug + '/';

		this.registeredBreakpoints.delete(runtimeSlug);

		if (fs.existsSync(debugTarget)) {
			const existingBreakpoints = fs.readdirSync(debugTarget);

			if (existingBreakpoints.length) {
				for (let i = 0; i < existingBreakpoints.length; i++) {
					fs.unlinkSync(path.join(debugTarget, existingBreakpoints[i]));
				}
			}
		}
	}

	setBreakPoint(bpPath: string, line: number): IRuntimeBreakpoint {
		const relativeTarget = this.getRelativePath(bpPath);

		const runtimeSlug = this.setRuntimeBreakpoint(relativeTarget, line);
		let registeredBps = this.registeredBreakpoints.get(runtimeSlug);

		if (!registeredBps) {
			registeredBps = new Map<number, IRuntimeBreakpoint>();
			this.registeredBreakpoints.set(runtimeSlug, registeredBps);
		}

		const bp:IRuntimeBreakpoint = {
			id: this.breakpointId++,
			line: line,
			verified: true,
			source: bpPath
		};

		registeredBps.set(line, bp);

		return bp;
	}

	public releaseActiveLock() {
		if (this._activeLock != '') {
			if (fs.existsSync(this._activeLock)) {
				fs.unlinkSync(this._activeLock);
			}
		}
	}

	private prepareDebugEnvironment() {
		if (fs.existsSync(this._debugRoot)) {
			if (!fs.existsSync(this._antlersDirectory)) {
				fs.mkdirSync(this._antlersDirectory);
				fs.mkdirSync(this._antlersDebugDirectory);
			} else {
				if (!fs.existsSync(this._antlersDebugDirectory)) {
					fs.mkdirSync(this._antlersDebugDirectory);
				}
			}

			if (!fs.existsSync(this._antlersDebugBreakpointRegistry)) {
				fs.mkdirSync(this._antlersDebugBreakpointRegistry);
			}

			if (!fs.existsSync(this._antlersDebugBreakpointLocks)) {
				fs.mkdirSync(this._antlersDebugBreakpointLocks);
			}

			const timingsFile = path.join(this._antlersDebugDirectory, 'timings');

			if (fs.existsSync(timingsFile)) {
				fs.unlinkSync(timingsFile);
			}

			chokdar.watch(this._antlersDebugDirectory).on('all', function (event, filePath) {
				if (filePath.endsWith('timings')) {
					if (event == 'unlink') {
						resetTimings();
					} else {
						try {
							if (fs.lstatSync(filePath).isDirectory() === false) {
								const runtimeTimings = JSON.parse(fs.readFileSync(filePath).toString()) as TimingInterface[];
								setTimings(runtimeTimings);
							}
						} catch (err) {
							console.error(err);
						}
					}
				} else if (filePath.endsWith('exception')) {
					if (event != 'unlink') {
						try {
							if (fs.lstatSync(filePath).isDirectory() === false) {
								const runtimeException = JSON.parse(fs.readFileSync(filePath).toString()) as IRuntimeException;

								fs.unlinkSync(filePath);
								this.sendEvent('runtimeException', runtimeException);
							}
						} catch (err) {
							if (fs.existsSync(filePath)) {
								fs.unlinkSync(filePath);
							}
							console.error(err);
						}
					}
				}
			}.bind(this));

			chokdar.watch(this._antlersDebugBreakpointLocks).on('all', function (event, lockPath) {
				if (event === 'add') {
					const fileName = path.basename(lockPath),
						parts = fileName.split('_');

					if (parts.length == 2) {
						const runtimeSlug = parts[0],
							lineNumber = parseInt(parts[1]);
						
						if (this.registeredBreakpoints.has(runtimeSlug)) {
							const fBps = this.registeredBreakpoints.get(runtimeSlug) as Map<number, IRuntimeBreakpoint>;

							if (fBps.has(lineNumber)) {
								if (fs.lstatSync(lockPath).isDirectory() === false) {
									const rtBp = fBps.get(lineNumber) as IRuntimeBreakpoint,
										content = JSON.parse(fs.readFileSync(lockPath).toString());

									this._activeLock = lockPath;
									this.sendEvent('breakpointLock', fileName, rtBp, content);
								}
							}
						}
					}
				}
			}.bind(this));

			return true;
		}

		return false;
	}

	

	private sendEvent(event: string, ... args: any[]): void {
		setImmediate(() => {
			this.emit(event, ...args);
		});
	}
}