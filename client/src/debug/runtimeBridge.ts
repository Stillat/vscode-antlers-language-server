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
	private _watchers:chokdar.FSWatcher[] = [];
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
		if (this._keepAliveInterval != null) {
			return;
		}

		this.writeKeepAlive();
		this._keepAliveInterval = setInterval(function () {
			this.writeKeepAlive();
		}.bind(this), 2000);
	}

	protected shutdownKeepAlive() {
		if (this._keepAliveInterval) {
			clearInterval(this._keepAliveInterval);
			this._keepAliveInterval = null;
		}

		try {
			if (fs.existsSync(this._antlersDebugKeepAliveFile)) {
				fs.unlinkSync(this._antlersDebugKeepAliveFile);
			}
		} catch (error) {
			console.error(error);
		}
	}

	private writeKeepAlive() {
		try {
			fs.writeFileSync(
				this._antlersDebugKeepAliveFile,
				(new Date()).valueOf().toString()
			);
		} catch (error) {
			console.error(error);
		}
	}

	async stopSession():Promise<void> {
		this.shutdownKeepAlive();
		this.releaseActiveLock();
		resetTimings();

		const watcherShutdown = this._watchers.map((watcher) => watcher.close());
		this._watchers = [];
		await Promise.all(watcherShutdown);
		this.removeAllListeners();
	}

	startSession() {
		if (!this._canBoot) {
			throw new Error(
				'Unable to initialize the Antlers debugger. The Statamic storage directory was not found.'
			);
		}

		this.startWatchers();
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
			try {
				if (fs.existsSync(this._activeLock)) {
					fs.unlinkSync(this._activeLock);
				}
			} finally {
				this._activeLock = '';
			}
		}
	}

	private startWatchers() {
		if (this._watchers.length > 0) {
			return;
		}
		const watcherOptions:chokdar.WatchOptions = {
			ignoreInitial: true,
			awaitWriteFinish: {
				stabilityThreshold: 50,
				pollInterval: 10
			}
		};

		const eventWatcher = chokdar.watch(
			[
				path.join(this._antlersDebugDirectory, 'timings'),
				path.join(this._antlersDebugDirectory, 'exception')
			],
			watcherOptions
		).on('all', function (event, filePath) {
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

		const breakpointWatcher = chokdar.watch(
			this._antlersDebugBreakpointLocks,
			watcherOptions
		).on('all', function (event, lockPath) {
			if (event === 'add') {
				const fileName = path.basename(lockPath),
					parts = fileName.split('_');

				if (parts.length == 2) {
					try {
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
					} catch (error) {
						// A malformed/partial lock must never leave the PHP request
						// blocked indefinitely.
						if (fs.existsSync(lockPath)) {
							fs.unlinkSync(lockPath);
						}
						console.error(error);
					}
				}
			}
		}.bind(this));

		this._watchers.push(eventWatcher, breakpointWatcher);
	}

	private prepareDebugEnvironment() {
		if (!fs.existsSync(this._debugRoot)) {
			return false;
		}

		fs.mkdirSync(this._antlersDebugDirectory, { recursive: true });
		fs.mkdirSync(this._antlersDebugBreakpointRegistry, { recursive: true });
		fs.mkdirSync(this._antlersDebugBreakpointLocks, { recursive: true });

		const timingsFile = path.join(this._antlersDebugDirectory, 'timings');

		if (fs.existsSync(timingsFile)) {
			fs.unlinkSync(timingsFile);
		}

		return true;
	}

	private sendEvent(event: string, ... args: any[]): void {
		setImmediate(() => {
			this.emit(event, ...args);
		});
	}
}
