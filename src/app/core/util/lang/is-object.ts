import {isArray} from "./is-array";
import {isDate} from "./is-date";

export function isObject(value: any): boolean {
    return value != null && typeof value == 'object' && !isDate(value) && !isArray(value);
}
