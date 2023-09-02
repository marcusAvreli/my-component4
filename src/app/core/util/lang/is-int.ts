import {isNumber} from "./is-number";

export function isInt(value: any): boolean {
    return isNumber(value) && value == Math.round(value);
}