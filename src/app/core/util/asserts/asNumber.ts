import {assert} from "./assert";
import {isNumber} from "../lang/is-number";
/**
 * Asserts that a value is a number.
 *
 * @param value Value supposed to be numeric.
 * @param nullOK Whether null values are acceptable.
 * @param positive Whether to accept only positive numeric values.
 * @return The number passed in.
 */
export function asNumber(value: number, nullOK: boolean = false, positive: boolean = false): number {
    assert((nullOK && value == null) || isNumber(value), 'Number expected.');
    if (positive && value && value < 0) {
        debugger;
        throw new Error('Positive number expected.');
    }
    return value;
}
