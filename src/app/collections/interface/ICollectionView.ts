import {INotifyCollectionChanged} from "./INotifyCollectionChanged";
//import {IQueryInterface} from "../../core/index";
import {IPredicate} from "./IPredicate";
import {ObservableArray} from "../ObservableArray";
import {EventEmitter} from "@angular/core";
import {Event} from "../../event/Event";
/**
 * Enables collections to have the functionalities of current record management,
 * custom sorting, filtering, and grouping.
 *
 * This is a JavaScript version of the <b>ICollectionView</b> interface used in
 * Microsoft's XAML platform. It provides a consistent, powerful, and  MVVM-friendly
 * way to bind data to UI elements.
 *
 * Wijmo includes several classes that implement @see:ICollectionView. The most
 * common is @see:CollectionView, which works based on regular JavsScript
 * arrays.
 */
export interface ICollectionView extends INotifyCollectionChanged/*, IQueryInterface */{

    /**
     * Gets a value that indicates whether this view supports filtering via the
     * @see:filter property.
     */
    canFilter: boolean;
    /**
     * Gets a value that indicates whether this view supports grouping via the
     * @see:groupDescriptions property.
     */
    canGroup: boolean;
    /**
     * Gets a value that indicates whether this view supports sorting via the
     * @see:sortDescriptions property.
     */
    canSort: boolean;
    /**
     * Gets the current item in the view.
     */
    currentItem: any;
    /**
     * Gets the ordinal position of the current item in the view.
     */
    currentPosition: number;
    /**
     * Gets or sets a callback used to determine if an item is suitable for
     * inclusion in the view.
     *
     * NOTE: If the filter function needs a scope (i.e. a meaningful 'this'
     * value), then remember to set the filter using the 'bind' function to
     * specify the 'this' object. For example:
     * <pre>
     *   collectionView.filter = this._filter.bind(this);
     * </pre>
     */
    filter: IPredicate;
    /**
     * Gets a collection of @see:GroupDescription objects that describe how the
     * items in the collection are grouped in the view.
     */
   // groupDescriptions: ObservableArray;
    /**
     * Gets the top-level groups.
     */
   // groups: any[];
    /**
     * Gets a value that indicates whether this view contains no items.
     */
   // isEmpty: boolean;
    /**
     * Gets a collection of @see:SortDescription objects that describe how the items
     * in the collection are sorted in the view.
     */
   // sortDescriptions: ObservableArray;
    /**
     * Gets or sets the collection object from which to create this view.
     */
    sourceCollection: any;
    /**
     * Returns a value that indicates whether a given item belongs to this view.
     *
     * @param item The item to locate in the collection.
     */
  //  contains(item: any): boolean;
    /**
     * Sets the specified item to be the current item in the view.
     *
     * @param item The item to set as the @see:currentItem.
     */
    moveCurrentTo(item: any): boolean;
    /**
     * Sets the first item in the view as the current item.
     */
    moveCurrentToFirst(): boolean;
    /**
     * Sets the last item in the view as the current item.
     */
    moveCurrentToLast(): boolean;
    /**
     * Sets the item after the current item in the view as the current item.
     */
   // moveCurrentToNext(): boolean;
    /**
     * Sets the item at the specified index in the view as the current item.
     *
     * @param index The index of the item to set as the @see:currentItem.
     */
    moveCurrentToPosition(index: number): boolean;
    /**
     * Sets the item before the current item in the view as the current item.
     */
   // moveCurrentToPrevious();
    /**
     * Re-creates the view using the current sort, filter, and group parameters.
     */
    refresh();
    /**
     * Occurs after the current item changes.
     */
   // currentChanged: EventEmitter<any>;
   //currentChanged (e: MouseEvent);
   currentChanged :Event;
    /**
     * Occurs before the current item changes.
     */
  //  currentChanging: EventEmitter<any>;

    // since we don't have IDisposable/using:

    /**
     * Suspends refreshes until the next call to @see:endUpdate.
     */
    beginUpdate();
    /**
     * Resumes refreshes suspended by a call to @see:beginUpdate.
     */
    endUpdate();
    /**
     * Executes a function within a beginUpdate/endUpdate block.
     *
     * The collection will not be refreshed until the function has been executed.
     * This method ensures endUpdate is called even if the function throws.
     *
     * @param fn Function to be executed within the beginUpdate/endUpdate block.
     */
  //  deferUpdate(fn: Function);

    // since we don't have IEnumerable:

    /**
     * Gets the filtered, sorted, grouped items in the view.
     */
    items: any[];

    //completeAllStream(): void;
}
