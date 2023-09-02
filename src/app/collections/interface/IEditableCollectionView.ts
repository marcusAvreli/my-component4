import {ICollectionView} from "./ICollectionView";
/**
 * Defines methods and properties that extend @see:ICollectionView to provide
 * editing capabilities.
 */
export interface IEditableCollectionView extends ICollectionView {
    /**
     * Gets a value that indicates whether a new item can be added to the collection.
     */
    canAddNew: boolean;
    /**
     * Gets a value that indicates whether the collection view can discard pending changes
     * and restore the original values of an edited object.
     */
    canCancelEdit: boolean;
    /**
     `        * Gets a value that indicates whether items can be removed from the collection.
     */
    canRemove: boolean;
    /**
     `        * Gets the item that is being added during the current add transaction.
     */
    currentAddItem: any;
    /**
     `        * Gets the item that is being edited during the current edit transaction.
     */
    currentEditItem: any;
    /**
     `        * Gets a value that indicates whether an add transaction is in progress.
     */
    isAddingNew: boolean;
    /**
     `        * Gets a value that indicates whether an edit transaction is in progress.
     */
    isEditingItem: boolean;
    /**
     `        * Adds a new item to the collection.
     *
     * @return The item that was added to the collection.
     */
    addNew(): any;
    /**
     * Ends the current edit transaction and, if possible,
     * restores the original value to the item.
     */
    cancelEdit();
    /**
     * Ends the current add transaction and discards the pending new item.
     */
    cancelNew();
    /**
     * Ends the current edit transaction and saves the pending changes.
     */
    commitEdit();
    /**
     * Ends the current add transaction and saves the pending new item.
     */
    commitNew();
    /**
     * Begins an edit transaction of the specified item.
     *
     * @param item Item to edit.
     */
    editItem(item: any);
    /**
     * Removes the specified item from the collection.
     *
     * @param item Item to remove from the collection.
     */
    remove(item: any);
    /**
     * Removes the item at the specified index from the collection.
     *
     * @param index Index of the item to remove from the collection.
     */
    removeAt(index: number);
}