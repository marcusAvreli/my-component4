import {Event} from "../../event/Event";
import {EventEmitter} from "@angular/core";
/**
 * Notifies listeners of dynamic changes, such as when items get added and
 * removed or when the collection is sorted, filtered, or grouped.
 */
export interface INotifyCollectionChanged {
    /**
     * Occurs when the collection changes.
     */
    collectionChanged: EventEmitter<any>;
}