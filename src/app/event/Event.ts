
import {asFunction} from "../core/index";
import {EventHandler} from "./EventHandler";
import {IEventHandler} from "./IEventHandler";
import {EventArgs} from "../eventArgs/EventArgs";
/**
 * Represents an event.
 *
 * Wijmo events are similar to .NET events. Any class may define events by
 * declaring them as fields. Any class may subscribe to events using the
 * event's @see:addHandler method and unsubscribe using the @see:removeHandler
 * method.
 *
 * Wijmo event handlers take two parameters: <i>sender</i> and <i>args</i>.
 * The first is the object that raised the event, and the second is an object
 * that contains the event parameters.
 *
 * Classes that define events follow the .NET pattern where for every event
 * there is an <i>on[EVENTNAME]</i> method that raises the event. This pattern
 * allows derived classes to override the <i>on[EVENTNAME]</i> method and
 * handle the event before and/or after the base class raises the event.
 * Derived classes may even suppress the event by not calling the base class
 * implementation.
 *
 * For example, the TypeScript code below overrides the <b>onValueChanged</b>
 * event for a control to perform some processing before and after the
 * <b>valueChanged</b> event fires:
 * <pre>
 *   // override base class
 *   onValueChanged(e: EventArgs) {
     *   // execute some code before the event fires
     *   console.log('about to fire valueChanged');
     *   // optionally, call base class to fire the event
     *   super.onValueChanged(e);
     *   // execute some code after the event fired
     *   console.log('valueChanged event just fired');
     * }
 * </pre>
 * @deprecated
 */
export class Event {
    private _handlers: EventHandler[] = [];

    /**
     * @deprecated
     */
    constructor(){

    }

    /**
     * Adds a handler to this event.
     *
     * @param handler Function invoked when the event is raised.
     * @param self Object that defines the event handler
     * (accessible as 'this' from the handler code).
     * @deprecated
     */
    addHandler(handler: IEventHandler, self?: any) {
        asFunction(handler);
        this._handlers.push(new EventHandler(handler, self));
    }
    /**
     * Removes a handler from this event.
     *
     * @param handler Function invoked when the event is raised.
     * @param self Object that defines the event handler (accessible as 'this' from the handler code).
     * @deprecated
     */
    removeHandler(handler: IEventHandler, self?: any) {
        asFunction(handler);
        for (let i = 0; i < this._handlers.length; i++) {
            const l = this._handlers[i];
            if (l.handler == handler || handler == null) {
                if (l.self == self || self == null) {
                    this._handlers.splice(i, 1);
                    if (handler && self) {
                        break;
                    }
                }
            }
        }
    }
    /**
     * Removes all handlers associated with this event.
     * @deprecated
     */
    removeAllHandlers() {
        this._handlers.length = 0;
    }
    /**
     * Raises this event, causing all associated handlers to be invoked.
     *
     * @param sender Source object.
     * @param args Event parameters.
     * @deprecated use EventEmitter.emit() instead
     */
    raise(sender: any, args = EventArgs.empty) {
        for (let i = 0; i < this._handlers.length; i++) {
            const l = this._handlers[i];
            l.handler.call(l.self, sender, args);
        }
    }
    /**
     * Gets a value that indicates whether this event has any handlers.
     * @deprecated
     */
    get hasHandlers(): boolean {
        return this._handlers.length > 0;
    }
}
