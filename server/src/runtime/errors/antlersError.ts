import { Md5 } from 'ts-md5';
import { AbstractNode } from '../nodes/abstractNode';
import { Range } from '../nodes/position';

export enum ErrrorLevel {
    Error = 0,
    Warning = 1
}

export class AntlersError {
    public node: AbstractNode | null = null;
    public errorCode = '';
    public message = '';
    public level: ErrrorLevel = ErrrorLevel.Error;
	public range:Range | null = null;

    hash() {
        let positionSlug = '';

        if (this.node != null) {
            positionSlug = (this.node.endPosition?.offset ?? 0).toString() + "|" +
                (this.node.startPosition?.offset ?? 0).toString() + "|";
        }

        return Md5.hashStr(positionSlug + "|" + this.errorCode + "|" + this.message);
    }

    static makeSyntaxError(errorCode: string, node: AbstractNode | null, message: string, level?: ErrrorLevel) {
        if (level == null) {
            level = ErrrorLevel.Error;
        }

        const error = new AntlersError();

        error.errorCode = errorCode;
        error.node = node;
        error.message = message;
        error.level = level;

        return error;
    }
}