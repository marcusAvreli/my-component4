import {assert} from "./assert";
import {isInt} from "../lang/is-int";
/**
 * Asserts that a value is an integer.
 *
 * @param value Value supposed to be an integer.
 * @param nullOK Whether null values are acceptable.
 * @param positive Whether to accept only positive integers.
 * @return The number passed in.
 */
export function asInt(value: number, nullOK = false, positive = false): number {
    assert((nullOK && value == null) || isInt(value), 'Integer expected.');
    if (positive && value && value < 0) throw 'Positive integer expected.';
    return value;
}