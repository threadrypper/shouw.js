export declare class Time {
    static format(_time: number): string;
    static parse(time: string | number): {
        ms: number;
        format: string;
    };
    static digital(time: number): string;
    private static pluralize;
}
