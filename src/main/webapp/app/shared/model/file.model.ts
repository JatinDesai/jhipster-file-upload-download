import { Moment } from 'moment';

export interface IFile {
    id?: number;
    title?: string;
    description?: string;
    creationDate?: Moment;
    userId?: number;
}

export class File implements IFile {
    constructor(
        public id?: number,
        public title?: string,
        public description?: string,
        public creationDate?: Moment,
        public userId?: number
    ) {}
}
