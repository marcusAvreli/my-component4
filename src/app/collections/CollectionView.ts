import {DateTime} from "../core/index";
import {Event} from "../event/Event";
import {EventArgs} from "../eventArgs/EventArgs";
import {CancelEventArgs} from "../eventArgs/CancelEventArgs";
import {assert, asFunction, asBoolean, clamp, isPrimitive, tryCast, asArray, asInt} from "../../core/index";
import {ObservableArray} from "./ObservableArray";
import {IEditableCollectionView} from "../collections/interface/IEditableCollectionView";
import {IPagedCollectionView} from "../collections/interface/IPagedCollectionView";
import {INotifyCollectionChanged} from "../collections/interface/INotifyCollectionChanged";
import {IPredicate} from "../collections/interface/IPredicate";
import {ICollectionView} from "../collections/interface/ICollectionView";
import {GroupDescription} from "./GroupDescription";
import {NotifyCollectionChangedEventArgs} from "./eventArgs/NotifyCollectionChangedEventArgs";
import {PageChangingEventArgs} from "./eventArgs/PageChangingEventArgs";
import {SortDescription} from "./SortDescription";
import {NotifyCollectionChangedAction} from "../enum/collections/NotifyCollectionChangedAction";
import {CollectionViewGroup} from "./CollectionViewGroup";
import {EventEmitter} from "@angular/core";
import {$$observable} from "rxjs/symbol/observable";
import {Observable, Subscriber} from "rxjs/Rx";

/**
 * Class that implements the @see:ICollectionView interface to expose data in
 * regular JavaScript arrays.
 *
 * The @see:CollectionView class implements the following interfaces:
 * <ul>
 *   <li>@see:ICollectionView: provides current record management,
 *       custom sorting, filtering, and grouping.</li>
 *   <li>@see:IEditableCollectionView: provides methods for editing,
 *       adding, and removing items.</li>
 *   <li>@see:IPagedCollectionView: provides paging.</li>
 * </ul>
 *
 * To use the @see:CollectionView class, start by declaring it and passing a
 * regular array as a data source. Then configure the view using the
 * @see:filter, @see:sortDescriptions, @see:groupDescriptions, and
 * @see:pageSize properties. Finally, access the view using the @see:items
 * property. For example:
 *
 * <pre>
 *   // create a new CollectionView
 *   var cv = new wijmo.collections.CollectionView(myArray);
 *   // sort items by amount in descending order
 *   var sd = new wijmo.collections.SortDescription('amount', false);
 *   cv.sortDescriptions.push(sd);
 *   // show only items with amounts greater than 100
 *   cv.filter = function(item) { return item.amount > 100 };
 *   // show the sorted, filtered result on the console
 *   for (var i = 0; i &lt; cv.items.length; i++) {
     *     var item = cv.items[i];
     *     console.log(i + ': ' + item.name + ' ' + item.amount);
     *   }
 * </pre>
 * @deprecated
 */
export class CollectionView extends Observable implements IEditableCollectionView, IPagedCollectionView {
    _src: any[];
    _ncc: INotifyCollectionChanged;
    _view: any[];
    _pgView: any[];
    _groups: CollectionViewGroup[];
    _fullGroups: CollectionViewGroup[];
    _digest: string;
    _idx           = -1;
    _filter: IPredicate;
    _srtDsc        = new ObservableArray();
    _grpDesc       = new ObservableArray();
    _newItem       = null;
    _edtItem       = null;
    _edtClone: any;
    _pgSz          = 0;
    _pgIdx         = 0;
    _updating      = 0;
    _itemCreator: Function;
    _canFilter     = true;
    _canGroup      = true;
    _canSort       = true;
    _canAddNew     = true;
    _canCancelEdit = true;
    _canRemove     = true;
    _canChangePage = true;
    _trackChanges  = false;
    _chgAdded      = new ObservableArray();
    _chgRemoved    = new ObservableArray();
    _chgEdited     = new ObservableArray();
    _srtCvt: Function;

    /**
     * Initializes a new instance of a @see:CollectionView.
     *
     * @param sourceCollection Array that serves as a source for this
     * @see:CollectionView.
     */
    constructor(sourceCollection?: any) {

        // check that sortDescriptions contains SortDescriptions
        this._srtDsc.collectionChanged.subscribe(() => {
            const arr = this._srtDsc;
            for (let i = 0; i < arr.length; i++) {
                assert(arr[i] instanceof SortDescription, 'sortDescriptions array must contain SortDescription objects.');
            }
            if (this.canSort) {
                this.refresh();
            }
        });

        // check that groupDescriptions contains GroupDescriptions
        this._grpDesc.collectionChanged.subscribe(() => {
            const arr = this._grpDesc;
            for (let i = 0; i < arr.length; i++) {
                assert(arr[i] instanceof GroupDescription, 'groupDescriptions array must contain GroupDescription objects.');
            }
            if (this.canGroup) {
                this.refresh();
            }
        });

        // initialize the source collection
        this.sourceCollection = sourceCollection ? sourceCollection : new ObservableArray();
    }

    /**
     * Gets or sets a function that creates new items for the collection.
     *
     * If the creator function is not supplied, the @see:CollectionView
     * will try to create an uninitilized item of the appropriate type.
     *
     * If the creator function is supplied, it should be a function that
     * takes no parameters and returns an initialized object of the proper
     * type for the collection.
     */
    get newItemCreator(): Function {
        return this._itemCreator;
    }

    set newItemCreator(value: Function) {
        this._itemCreator = asFunction(value);
    }

    /**
     * Gets or sets a function used to convert values when sorting.
     *
     * If provided, the function should take as parameters a
     * @see:SortDescription, a data item, and a value to convert,
     * and should return the converted value.
     *
     * This property provides a way to customize sorting. For example,
     * the @see:FlexGrid control uses it to sort mapped columns by
     * display value instead of by raw value.
     *
     * For example, the code below causes a @see:CollectionView to
     * sort the 'country' property, which contains country code integers,
     * using the corresponding country names:
     *
     * <pre>var countries = 'US,Germany,UK,Japan,Italy,Greece'.split(',');
     * collectionView.sortConverter = function (sd, item, value) {
         *   if (sd.property == 'countryMapped') {
         *     value = countries[value]; // convert country id into name
         *   }
         *   return value;
         * }</pre>
     */
    get sortConverter(): Function {
        return this._srtCvt;
    }

    set sortConverter(value: Function) {
        if (value != this._srtCvt) {
            this._srtCvt = asFunction(value, true);
        }
    }

    // ** IQueryInterface

    /**
     * Returns true if the caller queries for a supported interface.
     *
     * @param interfaceName Name of the interface to look for.
     */
    implementsInterface(interfaceName: string): boolean {
        switch (interfaceName) {
            case 'ICollectionView':
            case 'IEditableCollectionView':
            case 'IPagedCollectionView':
            case 'INotifyCollectionChanged':
                return true;
        }
        return false;
    }

    /**
     * Gets or sets a value that determines whether the control should
     * track changes to the data.
     *
     * If @see:trackChanges is set to true, the @see:CollectionView keeps
     * track of changes to the data and exposes them through the
     * @see:itemsAdded, @see:itemsRemoved, and @see:itemsEdited collections.
     *
     * Tracking changes is useful in situations where you need to to update
     * the server after the user has confirmed that the modifications are
     * valid.
     *
     * After committing or cancelling changes, use the @see:clearChanges method
     * to clear the @see:itemsAdded, @see:itemsRemoved, and @see:itemsEdited
     * collections.
     *
     * The @see:CollectionView only tracks changes made when the proper
     * @see:CollectionView methods are used (@see:editItem/@see:commitEdit,
     * @see:addNew/@see:commitNew, and @see:remove).
     * Changes made directly to the data are not tracked.
     */
    get trackChanges(): boolean {
        return this._trackChanges;
    }

    set trackChanges(value: boolean) {
        this._trackChanges = asBoolean(value);
    }

    /**
     * Gets an @see:ObservableArray containing the records that were added to
     * the collection since @see:changeTracking was enabled.
     */
    get itemsAdded(): ObservableArray {
        return this._chgAdded;
    }

    /**
     * Gets an @see:ObservableArray containing the records that were removed from
     * the collection since @see:changeTracking was enabled.
     */
    get itemsRemoved(): ObservableArray {
        return this._chgRemoved;
    }

    /**
     * Gets an @see:ObservableArray containing the records that were edited in
     * the collection since @see:changeTracking was enabled.
     */
    get itemsEdited(): ObservableArray {
        return this._chgEdited;
    }

    /**
     * Clears all changes by removing all items in the @see:itemsAdded,
     * @see:itemsRemoved, and @see:itemsEdited collections.
     *
     * Call this method after committing changes to the server or
     * after refreshing the data from the server.
     */
    clearChanges() {
        this._chgAdded.clear();
        this._chgRemoved.clear();
        this._chgEdited.clear();
    }

    // ** INotifyCollectionChanged

    /**
     * Occurs when the collection changes.
     */
    collectionChanged = new EventEmitter();

    /**
     * Raises the @see:collectionChanged event.
     *
     * @param e Contains a description of the change.
     */
    onCollectionChanged(e = NotifyCollectionChangedEventArgs.reset) {
        this.collectionChanged.emit(e);
    }

    // creates event args and calls onCollectionChanged
    private _raiseCollectionChanged(action = NotifyCollectionChangedAction.Reset, item?: any, index?: number) {
        //console.log('** collection changed: ' + NotifyCollectionChangedAction[action] + ' **');
        const e = new NotifyCollectionChangedEventArgs(action, item, index);
        this.onCollectionChanged(e);
    }

    // ** ICollectionView

    /**
     * Gets a value that indicates whether this view supports filtering via the
     * @see:filter property.
     */
    get canFilter(): boolean {
        return this._canFilter;
    }

    set canFilter(value: boolean) {
        this._canFilter = asBoolean(value);
    }

    /**
     * Gets a value that indicates whether this view supports grouping via the
     * @see:groupDescriptions property.
     */
    get canGroup(): boolean {
        return this._canGroup;
    }

    set canGroup(value: boolean) {
        this._canGroup = asBoolean(value);
    }

    /**
     * Gets a value that indicates whether this view supports sorting via the
     * @see:sortDescriptions property.
     */
    get canSort(): boolean {
        return this._canSort;
    }

    set canSort(value: boolean) {
        this._canSort = asBoolean(value);
    }

    /**
     * Gets or sets the current item in the view.
     */
    get currentItem(): any {
        return this._pgView && this._idx > -1 && this._idx < this._pgView.length
            ? this._pgView[this._idx]
            : null;
    }

    set currentItem(value: any) {
        this.moveCurrentTo(value);
    }

    /**
     * Gets the ordinal position of the current item in the view.
     */
    get currentPosition(): number {
        return this._idx;
    }

    /**
     * Gets or sets a callback used to determine if an item is suitable for
     * inclusion in the view.
     *
     * The callback function should return true if the item passed in as a
     * parameter should be included in the view.
     *
     * NOTE: If the filter function needs a scope (i.e. a meaningful 'this'
     * value) remember to set the filter using the 'bind' function to  specify
     * the 'this' object. For example:
     * <pre>
     *   collectionView.filter = this._filter.bind(this);
     * </pre>
     */
    get filter(): IPredicate {
        return this._filter;
    }

    set filter(value: IPredicate) {
        if (this._filter != value) {
            this._filter = <IPredicate>asFunction(value);
            if (this.canFilter) {
                this.refresh();
            }
        }
    }

    /**
     * Gets a collection of @see:GroupDescription objects that describe how the
     * items in the collection are grouped in the view.
     */
    get groupDescriptions(): ObservableArray {
        return this._grpDesc;
    }

    /**
     * Gets an array of @see:CollectionViewGroup objects that represents the
     * top-level groups.
     */
    get groups(): CollectionViewGroup[] {
        this._groups     = this.canGroup ? this._createGroups(this._view) : null;
        return this._groups;
    }

    /**
     * Gets a value that indicates whether this view contains no items.
     */
    get isEmpty(): boolean {
        return this._pgView.length == 0;
    }

    /**
     * Gets a collection of @see:SortDescription objects that describe how the items
     * in the collection are sorted in the view.
     */
    get sortDescriptions(): ObservableArray {
        return this._srtDsc;
    }

    /**
     * Gets or sets the underlying (unfiltered and unsorted) collection.
     */
    get sourceCollection(): any {
        return this._src;
    }

    set sourceCollection(sourceCollection: any) {
        if (sourceCollection != this._src) {

            // keep track of current index
            const index = this.currentPosition;

            // commit pending changes
            this.commitEdit();
            this.commitNew();

            // disconnect old source
            //todo ###remove me###
            //if (this._ncc != null) {
            //    this._ncc.collectionChanged.removeHandler(this._sourceChanged);
            //}

            // connect new source
            this._src = asArray(sourceCollection, false);
            this._ncc = <INotifyCollectionChanged>tryCast(this._src, 'INotifyCollectionChanged');
            if (this._ncc) {
                this._ncc.collectionChanged.subscribe(this._sourceChanged.bind(this));
            }

            // clear any changes
            this.clearChanges();

            // refresh view
            this.refresh();
            this.moveCurrentToFirst();

            // if we have no items, notify listeners that the current index changed
            if (this.currentPosition < 0 && index > -1) {
                this.onCurrentChanged();
            }
        }
    }

    // handle notifications from the source collection
    private _sourceChanged(s: INotifyCollectionChanged, e: NotifyCollectionChangedEventArgs) {
        if (this._updating <= 0) {
            this.refresh(); // TODO: optimize
        }
    }

    /**
     * Returns a value indicating whether a given item belongs to this view.
     *
     * @param item Item to seek.
     */
    contains(item: any): boolean {
        return this._pgView.indexOf(item) > -1;
    }

    /**
     * Sets the specified item to be the current item in the view.
     *
     * @param item Item that will become current.
     */
    moveCurrentTo(item: any): boolean {
        return this.moveCurrentToPosition(this._pgView.indexOf(item));
    }

    /**
     * Sets the first item in the view as the current item.
     */
    moveCurrentToFirst(): boolean {
        return this.moveCurrentToPosition(0);
    }

    /**
     * Sets the last item in the view as the current item.
     */
    moveCurrentToLast(): boolean {
        return this.moveCurrentToPosition(this._pgView.length - 1);
    }

    /**
     * Sets the item after the current item in the view as the current item.
     */
    moveCurrentToNext(): boolean {
        return this.moveCurrentToPosition(this._idx + 1);
    }

    /**
     * Sets the item at the specified index in the view as the current item.
     *
     * @param index Index of the item that will become current.
     */
    moveCurrentToPosition(index: number): boolean {
        if (index >= -1 && index < this._pgView.length) {
            const e = new CancelEventArgs();
            if (this._idx != index && this.onCurrentChanging(e)) {

                // when moving away from current edit/new item, commit
                if (this._edtItem && this._pgView[index] != this._edtItem) {
                    this.commitEdit();
                }
                if (this._newItem && this._pgView[index] != this._newItem) {
                    this.commitNew();
                }

                // update currency
                this._idx = index;
                this.onCurrentChanged();
            }
        }
        return this._idx == index;
    }

    /**
     * Sets the item before the current item in the view as the current item.
     */
    moveCurrentToPrevious(): boolean {
        return this.moveCurrentToPosition(this._idx - 1);
    }

    /**
     * Re-creates the view using the current sort, filter, and group parameters.
     */
    refresh() {

        // not while updating, adding, or editing
        if (this._updating > 0 || this._newItem || this._edtItem) {
            return;
        }

        // perform the refresh
        this._performRefresh();

        // notify listeners
        this.onCollectionChanged();
    }

    // performs the refresh (without issuing notifications)
    _performRefresh() {

        // benchmark
        //var start = new Date();

        // save current item
        const current = this.currentItem;

        // create filtered view
        if (!this._src) {
            this._view = [];
        } else if (!this._filter || !this.canFilter) {
            this._view = (this._srtDsc.length > 0 && this.canSort)
                ? this._src.slice(0) // clone source array
                : this._src; // don't waste time cloning
        } else {
            this._view = this._performFilter(this._src);
        }

        // apply sort
        if (this._srtDsc.length > 0 && this.canSort) {
            this._performSort(this._view);
        }

        // apply grouping
        this._groups     = this.canGroup ? this._createGroups(this._view) : null;
        this._fullGroups = this._groups;
        if (this._groups) {
            this._view = this._mergeGroupItems(this._groups);
        }

        // apply paging to view
        this._pgIdx  = clamp(this._pgIdx, 0, this.pageCount - 1);
        this._pgView = this._getPageView();

        // update groups to take paging into account
        if (this._groups && this.pageCount > 1) {
            this._groups = this._createGroups(this._pgView);
            this._mergeGroupItems(this._groups);
        }

        // restore current item
        let index = this._pgView.indexOf(current);
        if (index < 0) {
            index = Math.min(this._idx, this._pgView.length - 1);
        }
        this._idx = index;

        // save group digest to optimize updates (TFS 109119)
        this._digest = this._getGroupsDigest(this.groups);
        // raise currentChanged if needed
        if (this.currentItem !== current) {
            this.onCurrentChanged();
        }

        //var now = new Date();
        //console.log('refreshed in ' + (now.getTime() - start.getTime()) / 1000 + ' seconds');
    }

    // sorts an array in-place using the current sort descriptions
    _performSort(items: any[]) {
        this._view.sort(this._compareItems());
    }

    // this function is used in some of our samples, so
    // if we remove it or change its name some things will break...
    _compareItems() {
        const srtDsc = this._srtDsc,
              srtCvt = this._srtCvt,
              init   = true;
        return function (a, b) {
            for (let i = 0; i < srtDsc.length; i++) {

                // get values
                const sd = <SortDescription>srtDsc[i];
                let v1 = sd._bnd.getValue(a),
                      v2 = sd._bnd.getValue(b);

                // check for NaN (isNaN returns true for NaN but also for non-numbers)
                if (v1 !== v1) v1 = null;
                if (v2 !== v2) v2 = null;

                // ignore case when sorting unless the values are strings that only differ in case
                // (to keep the sort consistent, TFS 131135)
                if (typeof (v1) === 'string' && typeof (v2) === 'string') {
                    const lc1 = v1.toLowerCase(),
                          lc2 = v2.toLowerCase();
                    if (lc1 != lc2) {
                        v1 = lc1;
                        v2 = lc2;
                    }
                }

                // convert values
                if (srtCvt) {
                    v1   = srtCvt(sd, a, v1, init);
                    v2   = srtCvt(sd, b, v2, false);
                    init = false;
                }

                // nulls always at the bottom (like excel)
                if (v1 != null && v2 == null) return -1;
                if (v1 == null && v2 != null) return +1;

                // compare the values (at last!)
                let cmp = (v1 < v2) ? -1 : (v1 > v2) ? +1 : 0;
                if (cmp != 0) {
                    return sd.ascending ? +cmp : -cmp;
                }
            }
            return 0;
        }
    }

    // returns an array filtered using the current filter definition
    _performFilter(items: any[]): any[] {
        return this.canFilter && this._filter
            ? items.filter(this._filter, this)
            : items;
    }

    /**
     * Occurs after the current item changes.
     */
    currentChanged = new EventEmitter();

    /**
     * Raises the @see:currentChanged event.
     */
    onCurrentChanged(e = EventArgs.empty) {
        this.currentChanged.emit(e);
    }

    /**
     * Occurs before the current item changes.
     */
    currentChanging = new EventEmitter();

    /**
     * Raises the @see:currentChanging event.
     *
     * @param e @see:CancelEventArgs that contains the event data.
     */
    onCurrentChanging(e: CancelEventArgs): boolean {
        this.currentChanging.emit(e);
        return !e.cancel;
    }

    /**
     * Gets items in the view.
     */
    get items(): any[] {
        return this._pgView;
    }

    /**
     * Suspend refreshes until the next call to @see:endUpdate.
     */
    beginUpdate() {
        this._updating++;
    }

    /**
     * Resume refreshes suspended by a call to @see:beginUpdate.
     */
    endUpdate() {
        this._updating--;
        if (this._updating <= 0) {
            this.refresh();
        }
    }

    /**
     * Gets a value that indicates whether notifications are currently suspended
     * (see @see:beginUpdate and @see:endUpdate).
     */
    get isUpdating() {
        return this._updating > 0;
    }

    /**
     * Executes a function within a @see:beginUpdate/@see:endUpdate block.
     *
     * The collection will not be refreshed until the function finishes.
     * This method ensures @see:endUpdate is called even if the function throws.
     *
     * @param fn Function to be executed without updates.
     */
    deferUpdate(fn: Function) {
        try {
            this.beginUpdate();
            fn();
        } finally {
            this.endUpdate();
        }
    }

    // ** IEditableCollectionView

    /**
     * Gets a value that indicates whether a new item can be added to the collection.
     */
    get canAddNew(): boolean {
        return this._canAddNew;
    }

    set canAddNew(value: boolean) {
        this._canAddNew = asBoolean(value);
    }

    /**
     * Gets a value that indicates whether the collection view can discard pending changes
     * and restore the original values of an edited object.
     */
    get canCancelEdit(): boolean {
        return this._canCancelEdit;
    }

    set canCancelEdit(value: boolean) {
        this._canCancelEdit = asBoolean(value);
    }

    /**
     * Gets a value that indicates whether items can be removed from the collection.
     */
    get canRemove(): boolean {
        return this._canRemove;
    }

    set canRemove(value: boolean) {
        this._canRemove = asBoolean(value);
    }

    /**
     * Gets the item that is being added during the current add transaction.
     */
    get currentAddItem(): any {
        return this._newItem;
    }

    /**
     * Gets the item that is being edited during the current edit transaction.
     */
    get currentEditItem(): any {
        return this._edtItem;
    }

    /**
     * Gets a value that indicates whether an add transaction is in progress.
     */
    get isAddingNew(): boolean {
        return this._newItem != null;
    }

    /**
     * Gets a value that indicates whether an edit transaction is in progress.
     */
    get isEditingItem(): boolean {
        return this._edtItem != null;
    }

    /**
     * Creates a new item and adds it to the collection.
     *
     * This method takes no parameters. It creates a new item, adds it to the
     * collection, and prevents refresh operations until the new item is
     * committed using the @see:commitNew method or canceled using the
     * @see:cancelNew method.
     *
     * The code below shows how the @see:addNew method is typically used:
     *
     * <pre>
     * // create the new item, add it to the collection
     * var newItem = view.addNew();
     * // initialize the new item
     * newItem.id = getFreshId();
     * newItem.name = 'New Customer';
     * // commit the new item so the view can be refreshed
     * view.commitNew();
     * </pre>
     *
     * You can also add new items by pushing them into the @see:sourceCollection
     * and then calling the @see:refresh method. The main advantage of @see:addNew
     * is in user-interactive scenarios (like adding new items in a data grid),
     * because it gives users the ability to cancel the add operation. It also
     * prevents the new item from being sorted or filtered out of view until the
     * add operation is committed.
     *
     * @return The item that was added to the collection.
     */
    addNew(): any {

        // sanity
        if (arguments.length > 0) {
            assert(false, 'addNew does not take any parameters, it creates the new items.');
        }

        // commit pending changes
        this.commitEdit();
        this.commitNew();

        // honor canAddNew
        if (!this.canAddNew) {
            assert(false, 'cannot add items (canAddNew == false).');
            return null;
        }

        // create new item
        let item = null;
        if (this.newItemCreator) {
            item = this.newItemCreator();
        } else if (this.sourceCollection && this.sourceCollection.length) {
            item = this.sourceCollection[0].constructor();
        } else {
            item = {};
        }

        if (item != null) {

            // remember the new item
            this._newItem = item;

            // add the new item to the collection
            this._updating++;
            this._src.push(item); // **
            this._updating--;

            // add the new item to the bottom of the current view
            if (this._pgView != this._src) {
                this._pgView.push(item);
            }

            // add the new item to the last group and to the data items
            if (this.groups && this.groups.length) {
                let g = this.groups[this.groups.length - 1];
                g.items.push(item);
                while (g.groups && g.groups.length) {
                    g = g.groups[g.groups.length - 1];
                    g.items.push(item);
                }
            }

            // notify listeners
            this._raiseCollectionChanged(NotifyCollectionChangedAction.Add, item, this._pgView.length - 1);

            // select the new item
            this.moveCurrentTo(item);
        }

        // done
        return this._newItem;
    }

    /**
     * Ends the current edit transaction and, if possible,
     * restores the original value to the item.
     */
    cancelEdit() {
        const item = this._edtItem;
        if (item != null) {
            this._edtItem = null;

            // honor canCancelEdit
            if (!this.canCancelEdit) {
                assert(false, 'cannot cancel edits (canCancelEdit == false).');
                return;
            }

            // check that we can do this (TFS 110168)
            const index = this._src.indexOf(item);
            if (index < 0 || !this._edtClone) {
                return;
            }

            // restore original item value
            this._extend(this._src[index], this._edtClone);
            this._edtClone = null;

            // notify listeners
            this._raiseCollectionChanged(NotifyCollectionChangedAction.Change, item, index);
        }
    }

    /**
     * Ends the current add transaction and discards the pending new item.
     */
    cancelNew() {
        const item = this._newItem;
        if (item != null) {
            this.remove(item);
        }
    }

    /**
     * Ends the current edit transaction and saves the pending changes.
     */
    commitEdit() {
        const item = this._edtItem;
        if (item != null) {

            // check if anything really changed
            let sameContent = this._sameContent(item, this._edtClone);

            // clean up state
            this._edtItem  = null;
            this._edtClone = null;

            // refresh to update the edited item
            const index = this._pgView.indexOf(item);
            const digest = this._digest;
            this._performRefresh();

            // track changes (before notifying)
            if (this._trackChanges == true && !sameContent) {
                this._trackItemChanged(item);
            }

            // notify (single item change or full refresh)
            if (this._pgView.indexOf(item) == index && digest == this._digest) {
                this._raiseCollectionChanged(NotifyCollectionChangedAction.Change, item, index);
            } else {
                this._raiseCollectionChanged(); // full refresh
            }
        }
    }

    /**
     * Track changes applied to an item (not necessarily the current edit item).
     *
     * @param item Item that has been changed.
     */
    _trackItemChanged(item: any) {
        if (this._trackChanges) {
            let idx = this._chgEdited.indexOf(item);
            if (idx < 0 && this._chgAdded.indexOf(item) < 0) { // add item to changed list
                this._chgEdited.push(item);
            } else if (idx > -1) { // item already on changed list, notify of change
                var e = new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Change, item, idx);
                this._chgEdited.onCollectionChanged(e);
            } else { // item on added list, notify of change
                idx = this._chgAdded.indexOf(item);
                if (idx > -1) {
                    var e = new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Change, item, idx);
                    this._chgAdded.onCollectionChanged(e);
                }
            }
        }
    }

    /**
     * Ends the current add transaction and saves the pending new item.
     */
    commitNew() {
        const item = this._newItem;
        if (item != null) {

            // clean up state
            this._newItem = null;

            // refresh to update the new item
            const index = this._pgView.indexOf(item);
            const digest = this._digest;
            this._performRefresh();

            // track changes (before notifying)
            if (this._trackChanges == true) {
                const idx = this._chgEdited.indexOf(item);
                if (idx > -1) { // remove from changed if it's there
                    this._chgEdited.removeAt(idx);
                }
                if (this._chgAdded.indexOf(item) < 0) { // add to added if not there
                    this._chgAdded.push(item);
                }
            }

            // notify (full refresh if the item moved)
            if (this._pgView.indexOf(item) == index && digest == this._digest) {
                this._raiseCollectionChanged(NotifyCollectionChangedAction.Change, item, index);
            } else {
                this._raiseCollectionChanged(); // full refresh
            }
        }
    }

    /**
     * Begins an edit transaction of the specified item.
     *
     * @param item Item to be edited.
     */
    editItem(item: any) {

        // commit pending changes if not already editing/adding this item
        if (item != this._edtItem && this.moveCurrentTo(item)) {
            this.commitEdit();
            this._edtItem  = item;
            this._edtClone = {};
            this._extend(this._edtClone, this._edtItem);
        }
    }

    /**
     * Removes the specified item from the collection.
     *
     * @param item Item to be removed from the collection.
     */
    remove(item: any) {

        // handle cases where the user is adding or editing items
        let pendingNew = (item == this._newItem);
        if (pendingNew) {
            this._newItem = null;
        }
        if (item == this._edtItem) {
            this.cancelEdit();
        }

        // honor canRemove
        if (!this.canRemove) {
            assert(false, 'cannot remove items (canRemove == false).');
            return;
        }

        // find item
        const index = this._src.indexOf(item);
        if (index > -1) {

            // get current item to notify later
            const current = this.currentItem;

            // remove item from source collection
            this._updating++;
            this._src.splice(index, 1); // **
            this._updating--;

            // refresh to update the edited item
            //var index = this._pgView.indexOf(item);
            const digest = this._digest;
            this._performRefresh();

            // track changes (before notifying)
            if (this._trackChanges == true) {

                // removing something that was added
                const idxAdded = this._chgAdded.indexOf(item);
                if (idxAdded > -1) {
                    this._chgAdded.removeAt(idxAdded);
                }

                // removing something that was edited
                const idxEdited = this._chgEdited.indexOf(item);
                if (idxEdited > -1) {
                    this._chgEdited.removeAt(idxEdited);
                }

                // add to removed list unless it was pending and not added in this session
                const idxRemoved = this._chgRemoved.indexOf(item);
                if (idxRemoved < 0 && !pendingNew && idxAdded < 0) {
                    this._chgRemoved.push(item);
                }
            }

            // notify (item removed or full refresh) (TFS 85001)
            const paged = this.pageSize > 0 && this._pgIdx > -1;
            if (paged || digest != this._getGroupsDigest(this.groups)) {
                this._raiseCollectionChanged();
            } else {
                this._raiseCollectionChanged(NotifyCollectionChangedAction.Remove, item, index);
            }

            // raise currentChanged if needed
            if (this.currentItem !== current) {
                this.onCurrentChanged();
            }
        }
    }

    /**
     * Removes the item at the specified index from the collection.
     *
     * @param index Index of the item to be removed from the collection.
     * The index is relative to the view, not to the source collection.
     */
    removeAt(index: number) {
        index = asInt(index);
        this.remove(this._pgView[index]);
    }

    // extends an object (shallow copy)
    _extend(dst: any, src: any) {
        for (let key in src) {
            dst[key] = src[key];
        }
    }

    // checks whether two objects have the same content
    _sameContent(dst: any, src: any) {
        for (var key in src) {
            if (!this._sameValue(dst[key], src[key])) {
                return false;
            }
        }
        for (var key in dst) {
            if (!this._sameValue(dst[key], src[key])) {
                return false;
            }
        }
        return true;
    }

    // checks whether two values are the same
    _sameValue(v1: any, v2: any) {
        return v1 == v2 || DateTime.equals(v1, v2);
    }

    // ** IPagedCollectionView

    /**
     * Gets a value that indicates whether the @see:pageIndex value can change.
     */
    get canChangePage(): boolean {
        return this._canChangePage;
    }

    set canChangePage(value: boolean) {
        this._canChangePage = asBoolean(value);
    }

    /**
     * Gets a value that indicates whether the page index is changing.
     */
    get isPageChanging(): boolean {
        return false;
    }

    /**
     * Gets the total number of items in the view taking paging into account.
     */
    get itemCount(): number {
        return this._pgView.length;
    }

    /**
     * Gets the zero-based index of the current page.
     */
    get pageIndex(): number {
        return this._pgIdx;
    }

    /**
     * Gets or sets the number of items to display on a page.
     */
    get pageSize(): number {
        return this._pgSz;
    }

    set pageSize(value: number) {
        if (value != this._pgSz) {
            this._pgSz = asInt(value);
            this.refresh();
        }
    }

    /**
     * Gets the total number of items in the view before paging is applied.
     */
    get totalItemCount(): number {
        return this._view.length;
    }

    /**
     * Gets the total number of pages.
     */
    get pageCount(): number {
        return this.pageSize ? Math.ceil(this.totalItemCount / this.pageSize) : 1;
    }

    /**
     * Sets the first page as the current page.
     *
     * @return True if the page index was changed successfully.
     */
    moveToFirstPage(): boolean {
        return this.moveToPage(0);
    }

    /**
     * Sets the last page as the current page.
     *
     * @return True if the page index was changed successfully.
     */
    moveToLastPage(): boolean {
        return this.moveToPage(this.pageCount - 1);
    }

    /**
     * Moves to the page after the current page.
     *
     * @return True if the page index was changed successfully.
     */
    moveToNextPage(): boolean {
        return this.moveToPage(this.pageIndex + 1);
    }

    /**
     * Moves to the page at the specified index.
     *
     * @param index Index of the page to move to.
     * @return True if the page index was changed successfully.
     */
    moveToPage(index: number): boolean {
        const newIndex = clamp(index, 0, this.pageCount - 1);
        if (newIndex != this._pgIdx) {

            // honor canChangePage
            if (!this.canChangePage) {
                assert(false, 'cannot change pages (canChangePage == false).');
            }

            // raise pageChanging
            const e = new PageChangingEventArgs(newIndex);
            if (this.onPageChanging(e)) {

                // change the page
                this._pgIdx  = newIndex;
                this._pgView = this._getPageView();
                this._idx    = 0;

                // raise pageChanged and collectionChanged, or refresh if grouping
                if (!this.groupDescriptions || this.groupDescriptions.length == 0) {
                    this.onPageChanged();
                    this.onCollectionChanged();
                } else {
                    this.refresh();
                }
            }
        }
        return this._pgIdx == index;
    }

    /**
     * Moves to the page before the current page.
     *
     * @return True if the page index was changed successfully.
     */
    moveToPreviousPage(): boolean {
        return this.moveToPage(this.pageIndex - 1);
    }

    /**
     * Occurs after the page index changes.
     */
    pageChanged = new Event();

    /**
     * Raises the @see:pageChanged event.
     */
    onPageChanged(e = EventArgs.empty) {
        this.pageChanged.raise(this, e);
    }

    /**
     * Occurs before the page index changes.
     */
    pageChanging = new Event();

    /**
     * Raises the @see:pageChanging event.
     *
     * @param e @see:PageChangingEventArgs that contains the event data.
     */
    onPageChanging(e: PageChangingEventArgs): boolean {
        this.pageChanging.raise(this, e);
        return !e.cancel;
    }

    // gets the full group that corresponds to a paged group view
    _getFullGroup(g: CollectionViewGroup): CollectionViewGroup {

        // look for the group by level and name
        // this gets the full (unpaged) and updated group (TFS 109119)
        const fg = this._getGroupByPath(this._fullGroups, g.level, g._path);
        if (fg != null) {
            g = fg;
        }

        // return the group
        return g;
    }

    // gets a group from a collection by path
    _getGroupByPath(groups: CollectionViewGroup[], level: number, path: string) {
        for (let i = 0; i < groups.length; i++) {
            let g = groups[i];
            if (g.level == level && g._path == path) {
                return g;
            }
            if (g.level < level && g._path.indexOf(path) == 0) {
                g = this._getGroupByPath(g.items, level, path);
                if (g != null) {
                    return g;
                }
            }
        }
        return null;
    }

    // gets the list that corresponds to the current page
    _getPageView() {

        // not paging? return the whole view
        if (this.pageSize <= 0 || this._pgIdx < 0) {
            return this._view;
        }

        // slice the current page out of the view
        const start = this._pgSz * this._pgIdx,
              end   = Math.min(start + this._pgSz, this._view.length);
        return this._view.slice(start, end);
    }

    // creates a grouped view of the current page
    _createGroups(items: any[]): CollectionViewGroup[] {

        // not grouping? return null
        if (!this._grpDesc || !this._grpDesc.length) {
            return null;
        }

        // build group tree
        const root: CollectionViewGroup[] = [],
              maps                        = {};
        let map                           = null;
        for (let i = 0; i < items.length; i++) {

            // get the item
            const item   = items[i];
            let groups   = root;
            const levels = this._grpDesc.length;

            // add this item to the tree
            let path = '';
            for (let level = 0; level < levels; level++) {

                // get the group name for this level
                const gd   = this._grpDesc[level],
                      name = gd.groupNameFromItem(item, level),
                      last = level == levels - 1;

                // get the group map for this level (optimization)
                map = maps[path];
                if (!map && isPrimitive(name)) {
                    map        = {};
                    maps[path] = map;
                }

                // get or create the group
                const group = this._getGroup(gd, groups, map, name, level, last);

                // keep group path (all names in the hierarchy)
                path += '/' + name;
                group._path = path;

                // add data items to last level groups
                if (last) {
                    group.items.push(item);
                }

                // move on to the next group
                groups = group.groups;
            }
        }

        // done
        return root;
    }

    // gets a string digest of the current groups
    // this is used to check whether changes require a full refresh
    private _getGroupsDigest(groups): string {
        let digest = '';
        for (let i = 0; groups != null && i < groups.length; i++) {
            const g = groups[i];
            digest += '{' + g.name + ':' + (g.items ? g.items.length : '*');
            if (g.groups.length > 0) {
                digest += ',';
                digest += this._getGroupsDigest(g.groups);
            }
            digest += '}';
        }
        return digest;
    }

    // gets an array that contains all the children for a list of groups
    // NOTE: use "push.apply" instead of "concat" for much better performance
    // http://stackoverflow.com/questions/1374126/how-to-extend-an-existing-javascript-array-with-another-array
    private _mergeGroupItems(groups: CollectionViewGroup[]): any[] {
        const items = [];
        for (let i = 0; i < groups.length; i++) {
            const g = groups[i];
            if (!g._isBottomLevel) {
                const groupItems = this._mergeGroupItems(g.groups);
                g._items.push.apply(g._items, groupItems);
            }
            items.push.apply(items, g._items);
        }
        return items;
    }

    // finds or creates a group
    private _getGroup(gd: GroupDescription, groups: CollectionViewGroup[], map: any, name: string, level: number, isBottomLevel: boolean): CollectionViewGroup {
        let g: CollectionViewGroup;

        // find existing group
        if (map && isPrimitive(name)) {
            g = map[name];
            if (g) {
                return g;
            }
        } else {
            for (let i = 0; i < groups.length; i++) {
                if (gd.namesMatch(groups[i].name, name)) {
                    return groups[i];
                }
            }
        }

        // not found, create now
        const group = new CollectionViewGroup(gd, name, level, isBottomLevel);
        groups.push(group);

        // add group to map
        if (map) {
            map[name] = group;
        }

        // done
        return group;
    }

    public completeAllStream() {
        this.currentChanged.complete();
        this.collectionChanged.complete();
    }

    [$$observable] () {
        return this;
    }

    public _subscribe(subscriber: Subscriber) {
        subscriber.next(this.items);
        subscriber.complete();
    }
}
