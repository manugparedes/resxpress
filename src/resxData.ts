export class ResxData {
    public key: string;
    public value: string;
    public comment: string | undefined | null;
    constructor(key: string, value: string, comment: string | undefined | null = null) {
        this.key = key;
        this.value = value;
        this.comment = comment;
    }
}
