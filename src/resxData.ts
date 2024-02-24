

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface IResxData {
    value: string;

    comment: string | undefined | null;
}

export class ResxData implements IResxData {
    public value: string;
    public comment: string | null | undefined;

    constructor(value: string, comment: string | null | undefined = null) {
        this.value = value;
        this.comment = comment;
    }
}
