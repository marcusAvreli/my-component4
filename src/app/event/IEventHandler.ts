import {EventArgs} from "../eventArgs/EventArgs";
/**
 * Represents an event handler.
 * Event handlers are functions invoked when events are raised.
 *
 * Every event handler has two arguments:
 * <ul>
 *   <li><b>sender</b> is the object that raised the event, and</li>
 *   <li><b>args</b> is an optional object that contains the event parameters.</li>
 * </ul>
 */
export interface IEventHandler {
    (sender: any, args: EventArgs): void;
}