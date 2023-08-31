import {assert} from "./assert";
import {isString} from "../lang/is-string";
/**
 * Asserts that a value is a string.
 *
 * @param value Value supposed to be a string.
 * @param nullOK Whether null values are acceptable.
 * @return The string passed in.
 */
export function asString(value: string, nullOK = true): string {
    assert((nullOK && value == null) || isString(value), 'String expected.');
    return value;
}
