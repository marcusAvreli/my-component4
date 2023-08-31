import {assert} from "./assert";
import {isBoolean} from "../lang/is-boolean";
/**
 * Asserts that a value is a Boolean.
 *
 * @param value Value supposed to be Boolean.
 * @param nullOK Whether null values are acceptable.
 * @return The Boolean passed in.
 */
export function asBoolean(value: boolean, nullOK = false): boolean {
    assert((nullOK && value == null) || isBoolean(value), 'Boolean expected.');
    return value;
}
