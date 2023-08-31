/**
 * Describes the action that caused the @see:collectionChanged event.
 */
export enum NotifyCollectionChangedAction {
    /** items was added to the collection. */
    Add,
    /** items was removed from the collection. */
    Remove,
    /** items was changed or replaced. */
    Change,
    /**
     * Several items changed simultaneously, just index change
     * (for example, the collection was sorted, reverse, filtered, or grouped).
     */
    Reset,

    Splice
}
