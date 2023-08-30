//import {Color} from '../../common/ui/Color'
import {Control} from '../Control'
/*import {FormatItemEventArgs} from './../FormatItemEventArgs'
import {asCollectionView} from "../../util/asserts/asCollectionView";
import {asFunction} from "../../util/asserts/asFunction";
import {asString} from "../../util/asserts/asString";
import {hasItems} from "../../common/Global";
import {asNumber} from "../../util/asserts/asNumber";
import {toggleClass} from "../../util/dom/toggleClass";
import {contains} from "../../util/dom/contains";
import {isObject} from "../../util/isObject";
import {asArray} from "../../util/asserts/asArray";
import {EventArgs} from "../../eventArgs/EventArgs";
import {escapeHtml} from "../../util/escapeHtml";
import {hasClass} from "../../util/dom/hasClass";
import {Key} from "../../enum/Key";
import {tryCast} from "../../common/Global";
import {Event} from "../../event/Event";
import {asBoolean} from "../../util/asserts/asBoolean";

import {ICollectionView} from "../../interface/collections/ICollectionView";
import {IEditableCollectionView} from "../../interface/collections/IEditableCollectionView";
import {NotifyCollectionChangedEventArgs} from "../../core/collections/eventArgs/NotifyCollectionChangedEventArgs";
*/

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
	//_cv: ICollectionView;
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
		
				this.initialize(options);
			console.log("list_box_constructor_finish");
	}
	
	get itemsSource(): any {
		return this._items;
	}
	set itemsSource(value: any) {
	console.log("items_source_started");
	
		if (this._items != value) {

			// unbind current collection view
			/*
			if (this._cv) {
				this._cv.currentChanged.removeHandler(this._cvCurrentChanged, this);
				this._cv.collectionChanged.removeHandler(this._cvCollectionChanged, this);
				this._cv = null;
			}
*/
			console.log("setting_items");
			// save new data source and collection view
			this._items = value;
			//this._cv = asCollectionView(value);

			// bind new collection view
			/*
			if (this._cv != null) {
				this._cv.currentChanged.addHandler(this._cvCurrentChanged, this);
				this._cv.collectionChanged.addHandler(this._cvCollectionChanged, this);
			}
*/
			// update the list
			this._populateList();
			/*this.onItemsChanged();
			this.onSelectedIndexChanged();
			*/
		}
		console.log("items_source_finished");
	}
	
	
		// populate the list from the current itemsSource
		// populate the list from the current itemsSource
	private _populateList() {
console.log("populate_list_started");
		// get ready to populate
		const host = this.hostElement;
		if (host) {

			// remember if we have focus
			const focus = this.containsFocus();

			// fire event so user can clean up any current items
		//	this.onLoadingItems();

			// populate
			//host.innerHTML = '';
			/*
			if (this._cv) {
				for (let i = 0; i < this._cv.items.length; i++) {

					// get item text
					let text = this.getDisplayValue(i);
					if (this._html != true) {
						text = escapeHtml(text);
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
					if (this.formatItem.hasHandlers) {
						const e = new FormatItemEventArgs(i, this._cv.items[i], item);
						this.onFormatItem(e);
					}

					// add item to list
					host.appendChild(item);
				}
			}
*/
			// make sure the list is not totally empty
			// or min-height/max-height won't work properly in IE/Edge
			if (host.children.length == 0) {
				host.appendChild(document.createElement('div'));
			}

			// restore focus
			
			if (focus && !this.containsFocus()) {
				//this.focus();
				console.log("call focus");
			}

			// scroll selection into view
			//this.showSelection();

			// fire event so user can hook up to items
			//this.onLoadedItems();
		}
		console.log("populate_list_finished");
		
	}

}