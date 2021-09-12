import { CodeLens, CodeLensProvider, Position, Range, TextDocument } from 'vscode';
import { normalizePath } from '../utils/io';
import { ActiveTimings } from './antlersDebug';

function msToTime(ms: number) {
	if (ms < 1000) {
		return ms.toFixed(2) + ' ms';
	}

	const seconds = (ms / 1000);
	const minutes = (ms / (1000 * 60));
	const hours = (ms / (1000 * 60 * 60));
	const days = (ms / (1000 * 60 * 60 * 24));

	if (seconds < 60) return seconds + " sec";
	else if (minutes < 60) return minutes + " min";
	else if (hours < 24) return hours + " hrs";
	else return days + " days";
}

function executeLabel(times: number): string {
	if (times > 1) {
		return ' executions';
	}

	return ' execution';
}
  
export class TimingsLensProvider implements CodeLensProvider {

	provideCodeLenses(document: TextDocument) : CodeLens[] {
		const lenses:CodeLens[] = [],
			docFileName = normalizePath(document.fileName);

		for (let i = 0; i < ActiveTimings.length; i++) {
			const timing = ActiveTimings[i];

			if (timing.s !== null) {				
				if (timing.a === false) {
					continue;
				}

				if (docFileName.endsWith(timing.s)) {
					const lensRange = new Range(new Position(timing.l - 1, timing.c), new Position(timing.el - 1, timing.ec));
					const lens = new CodeLens(lensRange);
					
					lens.command = {
						title: msToTime(timing.e) + ' elapsed | ' + timing.t + executeLabel(timing.t),
						command: ''
					};


					lenses.push(lens);
				}
			}
		}

		return lenses;
	}

}
