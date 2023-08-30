/**
 * Throws an exception if a condition is false.
 *
 * @param condition Condition expected to be true.
 * @param msg Message of the exception if the condition is not true.
 */
export function assert(condition: boolean, msg: string) {
    if (!condition) {
        throw new Error('** Assertion failed in Wijmo: ' + msg);
    }
}
