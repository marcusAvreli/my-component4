/*
 * Represents an event handler (private class)
 */
import {IEventHandler} from "./IEventHandler";
export class EventHandler {
    handler: IEventHandler;
    self: any;
    constructor(handler: IEventHandler, self: any) {
        this.handler = handler;
        this.self = self;
    }
}