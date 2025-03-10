declare global {
    interface String {
        unescape(): string;
        escape(): string;
        JSONParse(): object;
        toURL(): string | undefined;
        toBoolean(): boolean;
    }
}

export {};
