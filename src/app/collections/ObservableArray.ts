import {ArrayBase} from "./ArrayBase";
import {INotifyCollectionChanged} from "../collections/interface/INotifyCollectionChanged";
import {NotifyCollectionChangedAction} from "../enum/collections/NotifyCollectionChangedAction";
import {asArray} from "../core/index";
import {EventEmitter} from "@angular/core";
import {NotifyCollectionChangedEventArgs} from "./eventArgs/NotifyCollectionChangedEventArgs";


export class ObservableArray extends ArrayBase implements INotifyCollectionChanged {

    constructor(data?: any[]) {
        super();
        if (data) {
            data = asArray(data);
            this.splice(0, 0, ...data);
        }
    }

    /**
     * Appends an item to the array.
     *
     * @param item Item to add to the array.
     * @return The new length of the array.
     */
    push(item: any): number {
        const rv = super.push(item);
        this.onCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Add, rv - 1, [], [item]));
        return rv;
    }

    /*
     * Removes the last item from the array.
     *
     * @return The item that was removed from the array.
     */
    pop(): any {
        const item = super.pop();
        this.onCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Remove, this.length, [item]));
        return item;
    }

    /**
     * Removes and/or adds items to the array.
     *
     * @param index Position where items will be added or removed.
     * @param count Number of items to remove from the array.
     * @param items Item to add to the array.
     * @return An array containing the removed elements.
     */
    splice(index: number, count: number, ...items: any[]): any[] {
        let removed;
        if (count && items.length > 0) {
            removed = super.splice(index, count, items);
            if(count == items.length) {
                this.onCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Change, index, removed, items));
            }
            this.onCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Splice, index, removed, items));
            return removed;
        } else if (items.length > 0) {
            removed = super.splice(index, count, items);
            this.onCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Add, index, [], items));
            return removed;
        }else {
            removed = super.splice(index, count);
            this.onCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Remove, index, removed, []));
            return removed;
        }
    }

    /**
     * Creates a shallow copy of a portion of an array.
     *
     * @param begin Position where the copy starts.
     * @param end Position where the copy ends.
     * @return A shallow copy of a portion of an array.
     */
    slice(begin?: number, end?: number): any[] {
        return super.slice(begin, end);
    }

    /**
     * Searches for an item in the array.
     *
     * @param searchElement Element to locate in the array.
     * @param fromIndex The index where the search should start.
     * @return The index of the item in the array, or -1 if the item was not found.
     */
    indexOf(searchElement: any, fromIndex?: number): number {
        return super.indexOf(searchElement, fromIndex);
    }

    /**
     * Sorts the elements of the array in place.
     *
     * @param compareFn Specifies a function that defines the sort order.
     * If specified, the function should take two arguments and should return
     * -1, +1, or 0 to indicate the first argument is smaller, greater than,
     * or equal to the second argument.
     * If omitted, the elements are sorted in ascending, ASCII character order.
     * @return A copy of the sorted array.
     */
    sort(compareFn?: Function): any[] {
        const rv = super.sort(compareFn);
        this.onCollectionChanged();
        return rv;
    }

    reverse() {
        const rv = super.reverse();
        this.onCollectionChanged();
        return rv;
    }

    /**
     * Inserts an item at a specific position in the array.
     *
     * @param index Position where the item will be added.
     * @param item Item to add to the array.
     */
    insert(index: number, item: any) {
        this.splice(index, 0, item);
    }

    /**
     * Removes an item from the array.
     *
     * @param item Item to remove.
     * @return True if the item was removed, false if it wasn't found in the array.
     */
    remove(item: any): boolean {
        const index = this.indexOf(item);
        if (index > -1) {
            this.removeAt(index);
            return true;
        }
        return false;
    }

    // reverse() {}
    /**
     * Removes an item at a specific position in the array.
     *
     * @param index Position of the item to remove.
     */
    removeAt(index: number) {
        this.splice(index, 1);
    }

    /**
     * Assigns an item at a specific position in the array.
     *
     * @param index Position where the item will be assigned.
     * @param item Item to assign to the array.
     */
    setAt(index: number, item: any) {
        this.splice(index, 1, item);
    }

    /**
     * Removes all items from the array.
     */
    clear() {
        if (this.length !== 0) {
            this.length = 0; // fastest way to clear an array
            this.onCollectionChanged();
        }
    }

    /**
     * Occurs when the collection changes.
     * fixed
     */
    collectionChanged = new EventEmitter(true);

    /**
     * Raises the {@link collectionChanged} event.
     *
     * @param e Contains a description of the change.
     */
    onCollectionChanged(e = NotifyCollectionChangedEventArgs.reset) {
        this.collectionChanged.emit(e);
    }
}
