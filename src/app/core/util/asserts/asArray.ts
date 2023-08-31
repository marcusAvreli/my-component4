import {isArray} from "../lang/is-array";
import {assert} from "../asserts/assert";
/**
 * Asserts that a value is an array.
 *
 * @param value Value supposed to be an array.
 * @param nullOK Whether null values are acceptable.
 * @return The array passed in.
 */
export function asArray(value: any, nullOK = true): any[] {
    assert((nullOK && value == null) || isArray(value), 'Array expected.');
    return value;
}
