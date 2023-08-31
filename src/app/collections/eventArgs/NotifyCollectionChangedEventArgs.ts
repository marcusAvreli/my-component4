import { EventArgs } from "../../eventArgs/EventArgs";
import { NotifyCollectionChangedAction } from "../../enum/collections/NotifyCollectionChangedAction";

/**
 * Provides data for the @see:collectionChanged event.
 */
export class NotifyCollectionChangedEventArgs extends EventArgs {
    /**
     * Provides a reset notification.
     */
    static reset = new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Reset);

    /**
     * Initializes a new instance of an {@link NotifyCollectionChangedEventArgs}.
     *
     * @param action Type of action that caused the event to fire.
     * @param index Index of the item.
     * @param removed Item that was removed.
     * @param added Item that was added.
     */
    constructor(public action: NotifyCollectionChangedAction,
                public index = -1,
                public removed: any[] = [],
                public added: any[] = []) {
        super();
    }
}
