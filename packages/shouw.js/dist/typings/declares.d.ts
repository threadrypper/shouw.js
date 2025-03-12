declare global {
    interface String {
        unescape(): string;
        escape(): string;
        mustEscape(): string;
        toObject(): object;
        toURL(): string | undefined;
        toBoolean(): boolean;
    }
}
export {};
