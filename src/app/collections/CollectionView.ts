//CollectionView.ts
import {Event} from "../event/Event";
import {EventArgs} from "../eventArgs/EventArgs";
import {CancelEventArgs} from "../eventArgs/CancelEventArgs";
import {DateTime} from "../core/common/datetime/datetime";

import {tryCast} from "../core/common/global";
import {asInt} from "../core/util/asserts/asInt";
import {asBoolean} from "../core/util/asserts/asBoolean";
import {asArray} from "../core/util/asserts/asArray";
import {assert} from "../core/util/asserts/assert";
import {asFunction} from "../core/util/asserts/asFunction";


import {ObservableArray} from "./ObservableArray";
//import {IEditableCollectionView} from "../collections/interface/IEditableCollectionView";
import {IPagedCollectionView} from "../collections/interface/IPagedCollectionView";
import {INotifyCollectionChanged} from "../collections/interface/INotifyCollectionChanged";
import {IPredicate} from "./interface/IPredicate";

//import {ICollectionView} from "../collections/interface/ICollectionView";

import {GroupDescription} from "./GroupDescription";
import {NotifyCollectionChangedEventArgs} from "./eventArgs/NotifyCollectionChangedEventArgs";
/*import {PageChangingEventArgs} from "./eventArgs/PageChangingEventArgs";
*/
import {SortDescription} from "./SortDescription";
import {NotifyCollectionChangedAction} from "../enum/collections/NotifyCollectionChangedAction";
/*import {CollectionViewGroup} from "./CollectionViewGroup";*/
//import {EventEmitter} from "@angular/core";
import {$$observable} from "rxjs/symbol/observable";
import {Observable, Subscriber} from "rxjs/Rx";
import {EventEmitter} from "@angular/core";
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
export class CollectionView /*extends Observable<any> */implements /*IEditableCollectionView,*/ IPagedCollectionView {
    _src: any[];
    _ncc: INotifyCollectionChanged;
    _view: any[];
    _pgView: any[];
   // _groups: CollectionViewGroup[];
    //_fullGroups: CollectionViewGroup[];
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
	// collectionChanged = new EventEmitter(true);
	collectionChanged = new Event();

    /**
     * Initializes a new instance of a @see:CollectionView.
     *
     * @param sourceCollection Array that serves as a source for this
     * @see:CollectionView.
     */
    constructor(sourceCollection?: any) {
//super();
        // check that sortDescriptions contains SortDescriptions
		console.log("collection_view_build_start");
        /*
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
		*/
		console.log("collection_view_build_finish:"+sourceCollection);
        // initialize the source collection
        this.sourceCollection = sourceCollection ? sourceCollection : new ObservableArray();
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
     * Re-creates the view using the current sort, filter, and group parameters.
     */
    refresh() {

        console.log("=========refresh_called==============");
		 // not while updating, adding, or editing
        if (this._updating > 0 || this._newItem || this._edtItem) {
            return;
        }

        // perform the refresh
        this._performRefresh();
		
		 // notify listeners
        this.onCollectionChanged();
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
	 moveCurrentTo(item: any): boolean {
        return this.moveCurrentToPosition(this._pgView.indexOf(item));
    }
	    moveCurrentToPosition(index: number): boolean {
		console.log("move_current_to_position:"+index);
		console.log("pgView:"+this._pgView.length);
        if (index >= -1 && index < this._pgView.length) {
            const e = new CancelEventArgs();
			console.log("here");
            if (this._idx != index && this.onCurrentChanging(e)) {
console.log("here2");
                // when moving away from current edit/new item, commit
                if (this._edtItem && this._pgView[index] != this._edtItem) {
				console.log("before_commit_edit");
                   // this.commitEdit();
                }
                if (this._newItem && this._pgView[index] != this._newItem) {
				console.log("before_commit_new");
                    //this.commitNew();
                }

                // update currency
				console.log("move_current_to_position_1:"+index);
                this._idx = index;
				console.log("call_current_changed");
                this.onCurrentChanged();
            }
        }
		
        return this._idx == index;
    }
 // performs the refresh (without issuing notifications)
    _performRefresh() {

        // benchmark
        //var start = new Date();
console.log("============perform_refresh==============");
        // save current item
        const current = this.currentItem;

        // create filtered view
		
		this._view =  this._src; // don't waste time cloning
		// this._view = this._performFilter(this._src);
		
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
		/*
        if (this._srtDsc.length > 0 && this.canSort) {
            this._performSort(this._view);
        }
*/
        // apply grouping
		/*
        this._groups     = this.canGroup ? this._createGroups(this._view) : null;
        this._fullGroups = this._groups;
        if (this._groups) {
            this._view = this._mergeGroupItems(this._groups);
        }
*/
        // apply paging to view
        //this._pgIdx  = clamp(this._pgIdx, 0, this.pageCount - 1);
        this._pgView = this._getPageView();

        // update groups to take paging into account
		/*
        if (this._groups && this.pageCount > 1) {
            this._groups = this._createGroups(this._pgView);
            this._mergeGroupItems(this._groups);
        }
*/
        // restore current item
        let index = this._pgView.indexOf(current);
		/*
        if (index < 0) {
            index = Math.min(this._idx, this._pgView.length - 1);
        }
		*/
        this._idx = index;

        // save group digest to optimize updates (TFS 109119)
       // this._digest = this._getGroupsDigest(this.groups);
        // raise currentChanged if needed
        if (this.currentItem !== current) {
		console.log("++++++++++on_current_changed+++++++++");
            this.onCurrentChanged();
        }

        //var now = new Date();
        //console.log('refreshed in ' + (now.getTime() - start.getTime()) / 1000 + ' seconds');
    }
 // gets the list that corresponds to the current page
    _getPageView() {
		//console.log("page_size:"+this.pageSize);
		console.log("_pgIdx:"+this._pgIdx);
		console.log("_pgIdx:"+this.pageSize);
        // not paging? return the whole view
       // if (this.pageSize <= 0 || this._pgIdx < 0) {
            return this._view;
        //}

        // slice the current page out of the view
		/*
        const start = this._pgSz * this._pgIdx,
              end   = Math.min(start + this._pgSz, this._view.length);
        return this._view.slice(start, end);
		*/
    }
    /**
     * Gets or sets the underlying (unfiltered and unsorted) collection.
     */
    get sourceCollection(): any {
        return this._src;
    }

    set sourceCollection(sourceCollection: any) {
		console.log("set_source_collection_started");
        if (sourceCollection != this._src) {
		console.log("source_collection_and_src_are_different");
            // keep track of current index
            const index = this.currentPosition;

            // commit pending changes
           // this.commitEdit();
           // this.commitNew();

            // disconnect old source
            //todo ###remove me###
            //if (this._ncc != null) {
            //    this._ncc.collectionChanged.removeHandler(this._sourceChanged);
            //}

            // connect new source
            this._src = asArray(sourceCollection, false);
            this._ncc = <INotifyCollectionChanged>tryCast(this._src, 'INotifyCollectionChanged');
			console.log("this._ncc:"+this._ncc);
            if (this._ncc) {
			console.log("********************* nc **********************");
               // this._ncc.collectionChanged.subscribe(this._sourceChanged.bind(this));
			   this._ncc.collectionChanged.addHandler(this._sourceChanged, this);
            }

            // clear any changes
  /*          this.clearChanges();
*/
            // refresh view
            this.refresh();
  /*          this.moveCurrentToFirst();
*/
            // if we have no items, notify listeners that the current index changed
            if (this.currentPosition < 0 && index > -1) {
			console.log("call_current_changed");
                this.onCurrentChanged();
            }
        }
    }
	 get currentPosition(): number {
        return this._idx;
    }
	/**
     * Gets items in the view.
     */
	 /*
    get items(): any[] {
        return  ['value1', 'value2', 'value3'];
    }
*/
/**
     * Gets items in the view.
     */
	 
    get items(): any[] {
        return this._pgView;
    }
  // handle notifications from the source collection
   private _sourceChanged(s: INotifyCollectionChanged, e: NotifyCollectionChangedEventArgs) {
		console.log("=================source_changed===================");
        if (this._updating <= 0) {
            this.refresh(); // TODO: optimize
        }
    }
	 currentChanging = new EventEmitter();

    /**
     * Raises the @see:currentChanging event.
     *
     * @param e @see:CancelEventArgs that contains the event data.
     */
    onCurrentChanging(e: CancelEventArgs): boolean {
	console.log("on_current_changing");
        this.currentChanging.emit(e);
        return !e.cancel;
    }
	
	  /**
     * Occurs after the current item changes.
     */
  //  currentChanged = new EventEmitter<any>();
currentChanged = new Event();
    /**
     * Raises the @see:currentChanged event.
     */
    
	onCurrentChanged(e?: EventArgs)  {
		console.log("on_current_changed");
        this.currentChanged.raise(this,e);
    }
	
	//currentChanged(e :MouseEvent) {
	//console.log("hello");
       // this.currentChanged.emit(e);
    //}
	 _performFilter(items: any[]): any[] {
        console.log("=============PERFORM FILTER================");
		console.log("this.canFilter:"+this.canFilter);
		   return this.canFilter && this._filter
            ? items.filter(this._filter, this)
            : items;
           // return items;
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
	
	onCollectionChanged(e = NotifyCollectionChangedEventArgs.reset) {
    //    this.collectionChanged.emit(e);
	    this.collectionChanged.raise(this,e);
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
               // var e = new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Change, item, idx);
			    var e = new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Change, idx);
                this._chgEdited.onCollectionChanged(e);
            } else { // item on added list, notify of change
                idx = this._chgAdded.indexOf(item);
                if (idx > -1) {
                    //var e = new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Change, item, idx);
					var e = new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Change,  idx);
                    this._chgAdded.onCollectionChanged(e);
                }
            }
        }
    }
	
	 // creates event args and calls onCollectionChanged
    private _raiseCollectionChanged(action = NotifyCollectionChangedAction.Reset, item?: any, index?: number) {
        //console.log('** collection changed: ' + NotifyCollectionChangedAction[action] + ' **');
       // const e = new NotifyCollectionChangedEventArgs(action, item, index);
	    const e = new NotifyCollectionChangedEventArgs(action,  index);
        this.onCollectionChanged(e);
    }
	
	
    // checks whether two values are the same
    _sameValue(v1: any, v2: any) {
        return v1 == v2 || DateTime.equals(v1, v2);
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
	
	//////////////////////////////////////
	//////  after items selectable 
	///////////////////
	 get filter(): IPredicate {
        return this._filter;
    }

    set filter(value: IPredicate) {
		console.log("=============value======================:"+value);
        if (this._filter != value) {
            this._filter = <IPredicate>asFunction(value);
            if (this.canFilter) {
                this.refresh();
            }
        }
		
    }
get pageSize(): number {
        return this._pgSz;
    }

    set pageSize(value: number) {
        if (value != this._pgSz) {
            this._pgSz = asInt(value);
            this.refresh();
        }
    }	  
}
