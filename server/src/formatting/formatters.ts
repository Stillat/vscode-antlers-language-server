import { AntlersDocument } from '../runtime/document/antlersDocument';

export type HTMLFormatter = (input: string) => string;
export type YAMLFormatter = (input: string) => string;
export type PHPFormatter = (input: string) => string;
export type PreFormatter = (document: AntlersDocument) => string | null;