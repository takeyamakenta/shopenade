import type { MinuteOption } from "@/@types/MinuteOption";

export function findMinuteByNumber(number: string | null | undefined, minuteOptions: MinuteOption[]): MinuteOption | undefined {
    if (number === null || number === undefined) {
        return undefined;
    }
    return minuteOptions.find((option) => option.value.toString() === number);
}