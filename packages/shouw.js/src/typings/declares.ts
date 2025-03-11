declare global {
    interface String {
        unescape(): string;
        escape(): string;
        toObject(): object;
        toURL(): string | undefined;
        toBoolean(): boolean;
    }
}

export {};
