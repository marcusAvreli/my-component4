import {assert} from "./assert";
import {isFunction} from "../lang/is-function";
/**
 * Asserts that a value is a function.
 *
 * @param value Value supposed to be a function.
 * @param nullOK Whether null values are acceptable.
 * @return The function passed in.
 */
export function asFunction(value: any, nullOK = true): Function {
    assert((nullOK && value == null) || isFunction(value), 'Function expected.');
    return value;
}
