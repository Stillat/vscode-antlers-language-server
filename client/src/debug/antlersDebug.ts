
import {
	LoggingDebugSession, InitializedEvent, StoppedEvent, Thread, Scope, Handles, Breakpoint
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { IRuntimeBreakpoint, IRuntimeException, RuntimeBridge } from './runtimeBridge';
import * as nodePath from 'path';

export interface TimingInterface {
	l: number,
	el: number,
	c: number,
	ec: number,
	t: number,
	e: number,
	s: string,
	a: boolean
}

let ActiveTimings:TimingInterface[] = [];

export function resetTimings() {
	ActiveTimings = [];
}

export function setTimings(timings:TimingInterface[]) {
	ActiveTimings = timings;
}

export {ActiveTimings};

export class AntlersDebugSession extends LoggingDebugSession {
	public static threadID = 1;
	
	private _runtimeBridge:RuntimeBridge;
	private _lastMemDump:any = null;
	private _hitBreakpoint:IRuntimeBreakpoint| null = null;
	private _variableHandles = new Handles<'root' | 'contextual' | 'other'>();
	private _resourceRoot = '';
	private _lastException:IRuntimeException | null = null;

	public constructor(debugRoot: string, resourceRoot: string) {
		super();

		this._resourceRoot = resourceRoot;
		this._runtimeBridge = new RuntimeBridge(debugRoot, resourceRoot);
		this._runtimeBridge.on('breakpointLock', (fn, bp: IRuntimeBreakpoint, memDump) => {
			this._lastMemDump = memDump;
			this._hitBreakpoint = bp;
			this.sendEvent(new StoppedEvent('breakpoint', AntlersDebugSession.threadID));			
		});
		this._runtimeBridge.on('runtimeException', (runtimeException: IRuntimeException) => {
			this._lastException = runtimeException;
			this.sendEvent(new StoppedEvent('exception', AntlersDebugSession.threadID));
		});
	}

	public shutdown(): void {
		void this._runtimeBridge.stopSession().finally(() => super.shutdown());
	}

	private objToArray(object:any) {
		const data = [];

		const kes = Object.keys(object);
		
		kes.forEach((n) => {
			data.push(object[n]);
		});

		return data;
	}

	private objToVarArray(object:any):DebugProtocol.Variable[] {
		const vars:DebugProtocol.Variable[] = [],
			tVars = this.objToArray(object);

		tVars.forEach((r) => {
			vars.push({
				name: r['name'],
				value: r['value'],
				variablesReference: r['variablesReference']
			});
		});

		return vars.sort((a, b) => (a.name > b.name) ? 1 : -1);
	}

	protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
		response.body = response.body || {};
		// the adapter implements the configurationDone request.
		response.body.supportsConfigurationDoneRequest = true;

		response.body.supportsEvaluateForHovers = false;
		response.body.supportsStepBack = false;

		
		response.body.supportsDataBreakpoints = false;
		response.body.supportsConditionalBreakpoints = false;
		response.body.supportsHitConditionalBreakpoints = false;
		response.body.supportsInstructionBreakpoints = false;
		response.body.supportsBreakpointLocationsRequest = true;


		// the adapter defines two exceptions filters, one with support for conditions.
		response.body.supportsExceptionFilterOptions = false;

		response.body.supportsExceptionInfoRequest = true;

		response.body.supportsSetVariable = false;
		response.body.supportsSetExpression = false;
		response.body.supportsWriteMemoryRequest = false;

		// Antlers debugging is driven by the Statamic runtime bridge. It can
		// continue from a breakpoint, but it does not expose instructions or
		// instruction-level stepping. Do not advertise requests we cannot serve.
		response.body.supportsDisassembleRequest = false;
		response.body.supportsSteppingGranularity = false;


		this._runtimeBridge.startSession();
		this.sendResponse(response);
		this.sendEvent(new InitializedEvent());
	}

	protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void {
		super.configurationDoneRequest(response, args);
	}

	protected launchRequest(response: DebugProtocol.LaunchResponse, args: DebugProtocol.LaunchRequestArguments) {
		response.success = true;
		this.sendResponse(response);
	}

	protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {

		response.body = {
			scopes: [
				new Scope('Root', this._variableHandles.create('root'), false),
				new Scope('Complex', this._variableHandles.create('other'), false),
				new Scope('Contextual', this._variableHandles.create('contextual'), false),
			]
		};

		this.sendResponse(response);
	}

	protected variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments, request?: DebugProtocol.Request) {
		response.body = { variables: [] };

		if (!this._variableHandles || !this._lastMemDump) {
			this.sendResponse(response);
			return;
		}

		const varHandle = this._variableHandles.get(args.variablesReference);

		if (varHandle && this._lastMemDump) {
			if (varHandle == 'root') {
				response.body.variables = this.objToVarArray(this._lastMemDump['data']['root']);
			} else if (varHandle == 'contextual') {
				response.body.variables = this.objToVarArray(this._lastMemDump['data']['contextual']);
			} else if (varHandle == 'other') {
				response.body.variables = this.objToVarArray(this._lastMemDump['data']['other']);
			}
		} else {
			if (this._lastMemDump['data']['additional'][args.variablesReference]) {
				response.body.variables = this.objToVarArray(this._lastMemDump['data']['additional'][args.variablesReference]);
			}
		}

		this.sendResponse(response);
	}

	protected breakpointLocationsRequest(response: DebugProtocol.BreakpointLocationsResponse, args: DebugProtocol.BreakpointLocationsArguments, request?: DebugProtocol.Request) {
		response.body = { breakpoints: [] };

		if (args.source.path) {
			const bps = this._runtimeBridge.getAllBreakPoints(args.source.path, args.line);

			response.body = {
				breakpoints: bps.map(b => {
					return {
						line: args.line,
						column: 1
					};
				})
			};
		}
		
		this.sendResponse(response);
	}

	protected exceptionInfoRequest(response: DebugProtocol.ExceptionInfoResponse, args: DebugProtocol.ExceptionInfoArguments) {
		if (!this._lastException) {
			this.sendResponse(response);
			return;
		}

		response.body = {
			exceptionId: this._lastException.type,
			description: this._lastException.msg,
			breakMode: 'always'
		};

		this._lastException = null;

		this.sendResponse(response);
	}

	protected stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments) {
		response.body = {
			stackFrames: [],
			totalFrames: 0
		};

		if (this._lastException != null) {
			response.body  = {
				stackFrames: [
					{
						line: this._lastException.rl,
						column: this._lastException.rc,
						id: 1,
						name: nodePath.basename(this._lastException.file),
						source: {
							path: nodePath.join(this._resourceRoot, this._lastException.file)
						}
					}
				]
			};

			this.sendResponse(response);
			return;
		}

		if (this._hitBreakpoint == null) {
			this.sendResponse(response);
			return;
		}

		response.body = {
			stackFrames: [
				{
					line: this._hitBreakpoint.line,
					column: 1,
					id: 1,
					name: nodePath.basename(this._hitBreakpoint.source),
					source: {
						path: this._hitBreakpoint.source
					}
				}
			]
		};
		
		this.sendResponse(response);
	}

	protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {

		// runtime supports no threads so just return a default thread.
		response.body = {
			threads: [
				new Thread(AntlersDebugSession.threadID, "thread 1")
			]
		};
		this.sendResponse(response);
	}

	protected continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments) {
		this._runtimeBridge?.releaseActiveLock();
		response.body = { allThreadsContinued: true };
		
		this.sendResponse(response);
	}

	protected async setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): Promise<void> {
		const sourcePath = args.source.path;

		if (sourcePath == null || sourcePath.trim().length === 0) {
			this.sendErrorResponse(response, 1005, 'An Antlers breakpoint source path is required.');
			return;
		}

		const path = nodePath.resolve(sourcePath),
			clientLines = args.lines || [];
		
		this._runtimeBridge.resetBreakPoints(path);

		const breakPoints = clientLines.map(l => {
			const runtimeBp = this._runtimeBridge.setBreakPoint(path, l);
			const bp = new Breakpoint(runtimeBp.verified, runtimeBp.line) as DebugProtocol.Breakpoint;
			bp.id  = runtimeBp.id;

			return bp;
		});

		response.body = {
			breakpoints: breakPoints
		};

		this.sendResponse(response);
	}
}
