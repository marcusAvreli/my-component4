/**
 * Base class for event arguments.
 */
export class EventArgs {
    /**
     * Provides a value to use with events that do not have event data.
     */
    static empty = new EventArgs();
}