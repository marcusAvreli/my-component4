//import {Color} from '../../common/ui/Color'
import {Control} from '../Control'
/*import {FormatItemEventArgs} from './../FormatItemEventArgs'*/
import {asCollectionView} from "../../core/util/asserts/asCollectionView";
//import {assert, asCollectionView} from "../../core/index";
/*import {asFunction} from "../../util/asserts/asFunction";

*/
import {asString} from "../../core/util/asserts/asString";
import {hasItems} from "../../core/common/global";
import {asNumber} from "../../core/util/asserts/asNumber";
import {toggleClass} from "../../core/util/dom/toggle-class";
import {contains} from "../../core/util/dom/contains";

import {isObject} from "../../core/util/lang/is-object";
import {asArray} from "../../core/util/asserts/asArray";

import {EventArgs} from "../../eventArgs/EventArgs";
/*import {escapeHtml} from "../../util/escapeHtml";
*/
import {hasClass} from "../../core/util/dom/has-class";

import {Key} from "../../enum/Key";
import {tryCast} from "../../core/common/global";

import {Event} from "../../event/Event";

import {asBoolean} from "../../core/util/asserts/asBoolean";

import {ICollectionView} from "../../collections/interface/ICollectionView";
//multi-select
import {IEditableCollectionView} from "../../collections/interface/IEditableCollectionView";
import {NotifyCollectionChangedEventArgs} from "../../collections/eventArgs/NotifyCollectionChangedEventArgs";


/**
 * The @see:ListBox control displays a list of items which may contain
 * plain text or HTML, and allows users to select items with the mouse or
 * the keyboard.
 *
 * Use the @see:selectedIndex property to determine which item is currently
 * selected.
 *
 * You can populate a @see:ListBox using an array of strings or you can use
 * an array of objects, in which case the @see:displayPath property determines
 * which object property is displayed on the list.
 *
 * To display HTML rather than plain text, set the @see:isContentHtml property
 * to true.
 *
 * The example below creates a @see:ListBox control and populates it using
 * a 'countries' array. The control updates its @see:selectedIndex and
 * @see:selectedItem properties as the user moves the selection.
 *
 * @fiddle:8HnLx
 */
export class ListBox extends Control {

	// property storage
	_items: any; // any[] or ICollectionView
	_cv: ICollectionView;
	//_itemFormatter: Function;
	_pathDisplay: string;
	_pathValue: string;
	_pathChecked: string;
	_html = false;

	// work variables
	_checking: boolean;
	_search = '';
	_toSearch: number;

	/**
	 * Initializes a new instance of a @see:ListBox.
	 *
	 * @param element The DOM element that hosts the control, or a selector for the host element (e.g. '#theCtrl').
	 * @param options The JavaScript object containing initialization data for the control.
	 */
	constructor(element: any, options?) {
		super(element);
		console.log("list_box_constructor_start");
			this.applyTemplate('wj-control wj-listbox wj-content', null, null);
				// handle mouse and keyboard
		const host = this.hostElement;
		this.addEventListener(host, 'click', this._click.bind(this));
		this.addEventListener(host, 'keydown', this._keydown.bind(this));
		this.addEventListener(host, 'keypress', this._keypress.bind(this));
				this.initialize(options);
			console.log("list_box_constructor_finish");
	}
	
	get itemsSource(): any {
		return this._items;
	}
	set itemsSource(value: any) {
	console.log("items_source_started");
	
		if (this._items != value) {
			const host = this.hostElement;
			// unbind current collection view
			/*
			if (this._cv) {
				this._cv.currentChanged.removeHandler(this._cvCurrentChanged, this);
				this._cv.collectionChanged.removeHandler(this._cvCollectionChanged, this);
				this._cv = null;
			}
*/
			//console.log("setting_items");
			// save new data source and collection view
			this._items = value;
			this._cv = asCollectionView(value);
			//console.log("=================================");
			//console.log("this:"+JSON.stringify(this._items));
			//console.log("=================================");
			// bind new collection view
			
			if (this._cv != null) {
			console.log("==================== cv is not null");
				//this._cv.currentChanged.addHandler(this._cvCurrentChanged, this);
				//this.addEventListener(host, 'currentChanged', this._cv.currentChanged);
					this._cv.currentChanged.addHandler(this._cvCurrentChanged, this);
					this._cv.collectionChanged.addHandler(this._cvCollectionChanged, this);
				//this.addEventListener(host, 'currentChanged', this._cv.currentChanged);
			//	this.addEventListener(this._cv,'_cvCurrentChanged',this._keydown.bind(this));
		//	this._cv.currentChanged.addHandler(	() => {console.log("add")});
				//this._cv.collectionChanged.addHandler(this._cvCollectionChanged, this);
			}

			// update the list
			this._populateList();
			this.onItemsChanged();
			this.onSelectedIndexChanged();
			
		}
		console.log("items_source_finished");
	}
	
	
		// populate the list from the current itemsSource
		// populate the list from the current itemsSource
	// populate the list from the current itemsSource
	private _populateList() {

		// get ready to populate
		const host = this.hostElement;
		if (host) {

			// remember if we have focus
			const focus = this.containsFocus();

			// fire event so user can clean up any current items
			this.onLoadingItems();

			// populate
			host.innerHTML = '';
			if (this._cv) {
				for (let i = 0; i < this._cv.items.length; i++) {

					// get item text
					let text = this.getDisplayValue(i);
					console.log("text:"+text);
					if (this._html != true) {
//						text = escapeHtml(text);

					}

					// add checkbox (without tabindex attribute: TFS 135857)
					if (this.checkedMemberPath) {
						const checked = this._cv.items[i][this.checkedMemberPath];
						text          = '<label><input type="checkbox"' + (checked ? ' checked' : '') + '> ' + text + '</label>';
					}

					// build item
					const item = document.createElement('div');
					item.innerHTML = text;
					item.className = 'wj-listbox-item';
					if (hasClass(<HTMLElement>item.firstChild, 'wj-separator')) {
						item.className += ' wj-separator';
					}

					// allow custom formatting
					/*/if (this.formatItem.hasHandlers) {
		//				const e = new FormatItemEventArgs(i, this._cv.items[i], item);
			//			this.onFormatItem(e);
					}
*/
					// add item to list
					host.appendChild(item);
				}
			}

			// make sure the list is not totally empty
			// or min-height/max-height won't work properly in IE/Edge
			if (host.children.length == 0) {
				host.appendChild(document.createElement('div'));
			}

			// restore focus
			/*
			if (focus && !this.containsFocus()) {
				this.focus();
			}
*/
			// scroll selection into view
			this.showSelection();

			// fire event so user can hook up to items
			this.onLoadedItems();
		}
	}
		/**
	 * Occurs after the list items are generated.
	 */
	loadedItems = new Event();
	/**
	 * Raises the @see:loadedItems event.
	 */
	onLoadedItems(e?: EventArgs) {
		this.loadedItems.raise(this, e);
	}
/**
	 * Gets the string displayed for the item at a given index.
	 *
	 * The string may be plain text or HTML, depending on the setting
	 * of the @see:isContentHtml property.
	 *
	 * @param index The index of the item.
	 */
	getDisplayValue(index: number): string {

		// get the text or html
		let item = null;
		if (index > -1 && hasItems(this._cv)) {
			item = this._cv.items[index];
			
			
			if (this.displayMemberPath) {
				item = item[this.displayMemberPath];
			}
		}
		let text = item != null ? item.toString() : '';
		console.log("text:"+text);
		// allow caller to override/modify the text or html
		
		if (this.itemFormatter) {
			text = this.itemFormatter(index, text);
		}

		// return the result
		return text;
	}
	get itemFormatter(): Function {
		return null;
	}
	set itemFormatter(value: Function) {
	/*
		if (value != this._itemFormatter) {
			this._itemFormatter = asFunction(value);
			this._populateList();
		}
		*/
	}
	/**
	 * Gets or sets the name of the property to use as the visual representation of the items.
	 */
	get displayMemberPath(): string {
		return this._pathDisplay;
	}
	set displayMemberPath(value: string) {
	
		if (value != this._pathDisplay) {
			this._pathDisplay = asString(value);
			this._populateList();
		}
	}
	
	////////////////////////////////////////////////////////////
//
//after drop down was shown on screen
//
/////////////////////////////////////////////////////////////
	
	
		/**
	 * Gets or sets the maximum height of the list.
	 */
	get maxHeight(): number {
		const host = this.hostElement;
		return host ? parseFloat(host.style.maxHeight) : null;
	}
	set maxHeight(value: number) {
		const host = this.hostElement;
		if (host) {
			host.style.maxHeight = asNumber(value) + 'px';
		}
	}
	
		/**
	 * Occurs when the value of the @see:selectedIndex property changes.
	 */
	selectedIndexChanged = new Event();
	/**
	 * Raises the @see:selectedIndexChanged event.
	 */
	onSelectedIndexChanged(e?: EventArgs) {
		console.log("selected_index_changed");
		this.selectedIndexChanged.raise(this, e);
	}
	
	get selectedIndex(): number {
		console.log("get_selected_index:");
		return this._cv ? this._cv.currentPosition : -1;
		//return 2;
	}
	set selectedIndex(value: number) {
		console.log("set_selected_index:"+value);
		if (this._cv) {
			this._cv.moveCurrentToPosition(asNumber(value));
		}
	}
	
	
	/**
	 * Gets or sets the index of the currently selected item.
	 */
	
	/**
	 * Gets or sets the item that is currently selected.
	 */
	get selectedItem(): any {
		console.log("============get_selected_item==========");
		return this._cv ? this._cv.currentItem: null;
	}
	set selectedItem(value: any) {
	console.log("============set_selected_item==========");
		if (this._cv) {
			this._cv.moveCurrentTo(value);
		}
	}
	/**
	 * Gets or sets the value of the @see:selectedItem obtained using the @see:selectedValuePath.
	 */
	get selectedValue(): any {
		console.log("============get_selected_value==========");
		let item = this.selectedItem;
		/*if (item && this.selectedValuePath) {
			item = item[this.selectedValuePath];
		}
		*/
		console.log("item:"+item);
		return item;
	}
	set selectedValue(value: any) {
		console.log("==================set_selected_value================");
		//let path  = this.selectedValuePath,
            //index = -1;
		if (this._cv) {
			/*for (let i = 0; i < this._cv.items.length; i++) {
				const item = this._cv.items[i];
				if ((path && item[path] == value) || (!path && item == value)) {
					index = i;
					break;
				}
			}*/
			this.selectedIndex = 1;
		}
	}
	
	/**
	 * Gets the @see:ICollectionView object used as the item source.
	 */
	get collectionView(): ICollectionView {
		return this._cv;
	}
	
		get isContentHtml(): boolean {
		return this._html;
	}
	set isContentHtml(value: boolean) {
		if (value != this._html) {
			this._html = asBoolean(value);
			this._populateList();
		}
	}
		getDisplayText(index: number): string {
		const children = this.hostElement.children,
              item     = index > -1 && index < children.length
                  ? <HTMLElement>children[index]
                  : null;
		return item != null ? item.textContent : '';
	}
	
	
	// click to select elements
	private _click(e: MouseEvent) {
		console.log("clicked");
		// select the item that was clicked
		const children = this.hostElement.children;
		for (let index = 0; index < children.length; index++) {
			if (contains(children[index], e.target)) {
			console.log("index_before_break:"+index);
				this.selectedIndex = index;
				break;
			}
		}

		// handle checkboxes
		
		if (this.checkedMemberPath && this.selectedIndex > -1) {
			const cb = this._getCheckbox(this.selectedIndex);
			if (cb == e.target) {
				this.setItemChecked(this.selectedIndex, cb.checked);
			}
		}
		
	}
	
	// handle keydown (cursor keys)
	private _keydown(e: KeyboardEvent) {

		// honor defaultPrevented
		if (e.defaultPrevented) return;

		// not interested in meta keys
		if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;

		// handle the event
		var index = this.selectedIndex,
			host = this.hostElement,
			children = host.children;
		switch (e.keyCode) {
			case Key.Down:
				e.preventDefault();
				if (index < children.length - 1) {
					this.selectedIndex++;
				}
				break;
			case Key.Up:
				e.preventDefault();
				if (index > 0) {
					this.selectedIndex--;
				}
				break;
			case Key.Home:
				e.preventDefault();
				this.selectedIndex = 0;
				break;
			case Key.End:
				e.preventDefault();
				this.selectedIndex = children.length - 1;
				break;
			case Key.PageDown:
				e.preventDefault();
				if (this.selectedIndex > -1) {
					var index = this.selectedIndex,
						height = host.offsetHeight,
						offset = 0;
					for (var i = index + 1; i < this._cv.items.length; i++) {
						var itemHeight = children[i].scrollHeight;
						if (offset + itemHeight > height) {
							this.selectedIndex = i;
							break;
						}
						offset += itemHeight;
					}
					if (this.selectedIndex == index) {
						this._cv.moveCurrentToLast();
					}
				}
				break;
			case Key.PageUp:
				e.preventDefault();
				if (this.selectedIndex > -1) {
					var index = this.selectedIndex,
						height = host.offsetHeight,
						offset = 0;
					for (var i = index - 1; i > 0; i--) {
						var itemHeight = children[i].scrollHeight;
						if (offset + itemHeight > height) {
							this.selectedIndex = i;
							break;
						}
						offset += itemHeight;
					}
					if (this.selectedIndex == index) {
						this._cv.moveCurrentToFirst();
					}
				}
				break;
			case Key.Space:
				/*if (this.checkedMemberPath && this.selectedIndex > -1) {
					const cb = this._getCheckbox(this.selectedIndex);
					if (cb) {
						this.hostElement.focus(); // take focus from the checkbox (FireFox, TFS 135857)
						this.setItemChecked(this.selectedIndex, !cb.checked);
						e.preventDefault();
					}
				}
				*/
				break;
		}
	}
	
	// handle keypress (select/search)
	private _keypress(e: KeyboardEvent) {

		// honor defaultPrevented
		if (e.defaultPrevented) return;

		// don't interfere with inner input elements (TFS 132081)
		if (e.target instanceof HTMLInputElement) return;

		// auto search
		if (e.charCode > 32 || (e.charCode == 32 && this._search)) {
			e.preventDefault();

			// update search string
			this._search += String.fromCharCode(e.charCode).toLowerCase();
			if (this._toSearch) {
				clearTimeout(this._toSearch);
			}
			this._toSearch = setTimeout(() => {
				this._toSearch = 0;
				this._search = '';
			}, 600);

			// perform search
			if (this.hostElement) {
				const cnt = this.hostElement.childElementCount;
				for (let off = this._search.length > 1 ? 0 : 1; off < cnt; off++) {
					const idx = (this.selectedIndex + off) % cnt,
                          txt = this.getDisplayText(idx).trim().toLowerCase();
					if (txt.indexOf(this._search) == 0) {
						this.selectedIndex = idx;
						break;
					}
				}
			}
		}
	}
	
		private _cvCurrentChanged(sender: any, e: EventArgs) {
		console.log("cv_current_changed");
		this.showSelection();
		this.onSelectedIndexChanged();
	}
	
	showSelection() {
	console.log("show_selection_started");
		const index    = this.selectedIndex,
              host     = this.hostElement,
              children = host.children;
        let e: HTMLElement;

		// highlight
		for (let i = 0; i < children.length; i++) {
			e = <HTMLElement>children[i];
			//console.log("show_selectset_selected");
			toggleClass(e, 'wj-state-selected', i == index);
		}

		// scroll into view
		if (index > -1 && index < children.length) {
			e = <HTMLElement>children[index];
			const rco = e.getBoundingClientRect();
			const rcc = this.hostElement.getBoundingClientRect();
			if (rco.bottom > rcc.bottom) {
				host.scrollTop += rco.bottom - rcc.bottom;
			} else if (rco.top < rcc.top) {
				host.scrollTop -= rcc.top - rco.top;
			}
		}

		// make sure the focus is within the selected element (TFS 135278)
		if (index > -1 && this.containsFocus()) {
			e = <HTMLElement>children[index];
			if (e instanceof HTMLElement && !contains(e, document.activeElement)) {
				e.focus();
			}
		}
		console.log("show_selection_finished");
	}
	// handle changes to the data source
	private _cvCollectionChanged(sender: any, e: NotifyCollectionChangedEventArgs) {
		if (!this._checking) {
			this._populateList();
			this.onItemsChanged();
		}
	}
		/**
	 * Occurs when the list of items changes.
	 */
	itemsChanged = new Event();
	/**
	 * Raises the @see:itemsChanged event.
	 */
	onItemsChanged(e?: EventArgs) {
		this.itemsChanged.raise(this, e);
	}
loadingItems = new Event();
	/**
	 * Raises the @see:loadingItems event.
	 */
	onLoadingItems(e?: EventArgs) {
		this.loadingItems.raise(this, e);
	}
	
	
	
	/////////////////////////////////////////
	//////
	/////// multi select
	///////
	/////////////////////////////////////////////
	
	/**
	 * Gets or sets an array containing the items that are currently checked.
	 */
	get checkedItems(): any[] {
		const arr = [];
		if (this._cv) {
			for (let i = 0; i < this._cv.items.length; i++) {
				if (this.getItemChecked(i)) {
					arr.push(this._cv.items[i]);
				}
			}
		}
		return arr;
	}
	set checkedItems(value: any[]) {
		const cv  = this._cv,
              arr = asArray(value, false);
		if (cv && arr) {
			const pos = cv.currentPosition;
			for (let i = 0; i < cv.items.length; i++) {
				const item = cv.items[i];
				this._setItemChecked(i, arr.indexOf(item) > -1, false);
			}
			cv.moveCurrentToPosition(pos);
			this.onCheckedItemsChanged();
		}
	}
	
		/**
	 * Gets the checked state of an item on the list.
	 *
	 * This method is applicable only on multi-select listboxes
	 * (see the @see:checkedMemberPath property).
	 *
	 * @param index Item index.
	 */
	getItemChecked(index: number): boolean {
		const item = this._cv.items[index];
		if (isObject(item) && this.checkedMemberPath) {
			return item[this.checkedMemberPath];
		}
		const cb = this._getCheckbox(index);
		return cb ? cb.checked : false;
	}
		setItemChecked(index: number, checked: boolean) {
		this._setItemChecked(index, checked, true);
	}
	// sets the checked state of an item on the list
	_setItemChecked(index: number, checked: boolean, notify = true) {

		// update data item
		const item = this._cv.items[index];
		if (isObject(item)) {
			const ecv = <IEditableCollectionView>tryCast(this._cv, 'IEditableCollectionView');
			if (item[this.checkedMemberPath] != checked) {
				this._checking = true;
				if (ecv) {
					ecv.editItem(item);
					item[this.checkedMemberPath] = checked;
					ecv.commitEdit();
				} else {
					item[this.checkedMemberPath] = checked;
					this._cv.refresh();
				}
				this._checking = false;
			}
		}

		// update checkbox value
		const cb = this._getCheckbox(index);
		if (cb && cb.checked != checked) {
			cb.checked = checked;
		}

		// fire events
		if (notify) {
			this.onItemChecked();
			this.onCheckedItemsChanged();
		}
	}
	
	// gets the checkbox element in a ListBox item
	private _getCheckbox(index: number) {
		if (!this.hostElement) {
			return null;
		}
		const li = this.hostElement.children[index];
		return <HTMLInputElement>li.querySelector('input[type=checkbox]');
	}
	
	/**
	 * Occurs when the current item is checked or unchecked by the user.
	 *
	 * This event is raised when the @see:checkedMemberPath is set to the name of a
	 * property to add checkboxes to each item in the control.
	 *
	 * Use the @see:selectedItem property to retrieve the item that was checked or
	 * unchecked.
	 */
	itemChecked = new Event();
	/**
	 * Raises the @see:itemCheched event.
	 */
	onItemChecked(e?: EventArgs) {
		this.itemChecked.raise(this, e);
	}
	/**
	 * Occurs when the value of the @see:checkedItems property changes.
	 */
	checkedItemsChanged = new Event();
	/**
	 * Raises the @see:checkedItemsChanged event.
	 */
	onCheckedItemsChanged(e?: EventArgs) {
		this.checkedItemsChanged.raise(this, e);
	}
		/**
	 * Gets or sets the name of the property used to control the checkboxes
	 * placed next to each item.
	 *
	 * Use this property to create multi-select lisboxes.
	 * When an item is checked or unchecked, the control raises the @see:itemChecked event.
	 * Use the @see:selectedItem property to retrieve the item that was checked or unchecked,
	 * or use the @see:checkedItems property to retrieve the list of items that are currently
	 * checked.
	 */
	get checkedMemberPath() {
		return this._pathChecked;
	}
	set checkedMemberPath(value: string) {
		if (value != this._pathChecked) {
			this._pathChecked = asString(value);
			this._populateList();
		}
	}
}