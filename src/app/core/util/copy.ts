import {isObject} from "./lang/is-object";
import {isFunction} from "./lang/is-function";
import {assert} from "./asserts/assert";


/**
 * Copies properties from an object to another.
 *
 * This method is typically used to initialize controls and other Wijmo objects
 * by setting their properties and assigning event handlers.
 *
 * The destination object must define all the properties defined in the source,
 * or an error will be thrown.
 *
 * @param dst The destination object.
 * @param src The source object.
 */
export function copy(dst: any, src: any) {
    for (let key in src) {
        assert(key in dst, 'Unknown key "' + key + '".');
        const value = src[key];
        if (!dst._copy || !dst._copy(key, value)) { // allow overrides
            if (dst[key] instanceof Event && isFunction(value)) {
                dst[key].addHandler(value); // add event handler
            } else if (isObject(value) && dst[key]) {
                copy(dst[key], value); // copy sub-objects
            } else {
                dst[key] = value; // assign values
            }
        }
    }
}
