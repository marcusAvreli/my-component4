import { DropDown } from './DropDown';
import { ListBox } from './ListBox/ListBox';
import {EventArgs} from "../eventArgs/EventArgs";
import {CancelEventArgs} from "../eventArgs/CancelEventArgs";
import {Event} from "../event/Event";
import {Key} from "../enum/Key";
import {hasItems} from "../core/common/global";
import {setSelectionRange} from "../core/common/global";
import {asBoolean} from "../core/util/asserts/asBoolean";
import {asString} from "../core/util/asserts/asString";
import {ICollectionView} from "../collections/interface/ICollectionView";
export class ComboBox extends DropDown {

	// child elements
	_lbx: ListBox;

	// property storage
	_required = true;
	_editable = false;

	// private stuff
	_composing = false;
	_deleting = false;
	_settingText = false;
	_cvt: HTMLElement;
	_hdrPath: string;
	
	constructor(element: any, options?) {
		super(element);
	this.autoExpandSelection = false;
		// disable auto-expand by default
		//this.autoExpandSelection = false;
		console.log("constructor_combo");
		// handle IME
		this.addEventListener(this._tbx, 'compositionstart', () => {
			this._composing = true;
		});
		
		this.addEventListener(this._tbx, 'compositionend', () => {
			this._composing = false;
			this._setText(this.text, true);
		});
		
			// use wheel to scroll through the items
		const evt = 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';
		this.addEventListener(this.hostElement, evt, (e: MouseWheelEvent) => {
			if (this.containsFocus() && !this.isDroppedDown && !e.defaultPrevented) {
				if (this.selectedIndex > -1) {
					//const step         = clamp(e.wheelDelta || -e.detail, -1, +1);
					//this.selectedIndex = clamp(this.selectedIndex - step, 0, this.collectionView.items.length - 1);
					this.selectedIndex=1;
					e.preventDefault();
				}
			}
		});
		// initializing from <select> tag
		if (this._orgTag == 'SELECT') {
		console.log("select=====================^^^&&&");
		//	this._copyOriginalAttributes(this.hostElement);
			//this._lbx._populateSelectElement(this.hostElement);
		}
		this.initialize(options);
}

	set itemsSource(value: any) {
		console.log("set_items");
		this._lbx.itemsSource = value;
		this._updateBtn();
	}
	/**
	 * Gets the @see:ListBox control shown in the drop-down.
	 */
	get listBox(): ListBox {
		return this._lbx;
	}
		_createDropDown() {

		console.log("create_drop_down_started");
		// create the drop-down element
		console.log("create_drop_down:"+this._dropDown);
		this._lbx = new ListBox(this._dropDown);

		// limit the size of the drop-down
		this._lbx.maxHeight = 200;

		// update our selection when user picks an item from the ListBox
		// or when the selected index changes because the list changed
		this._lbx.selectedIndexChanged.addHandler(() => {
			this._updateBtn();
			console.log("adding handler");
			this.selectedIndex = this._lbx.selectedIndex;
			this.onSelectedIndexChanged();
		});

		// update button display when item list changes
		this._lbx.itemsChanged.addHandler(() => {
			this._updateBtn();
		});

		// close the drop-down when the user clicks to select an item
		this.addEventListener(this._dropDown, 'click', (e: MouseEvent) => {
			if (e.target != this._dropDown) { // an item, not the list itself...
				console.log("close_drop_down=======================");
				this.isDroppedDown = false;
			}
		});
	
		console.log("create_drop_down_finished");
	}
	
		get selectedIndex(): number {
		return this._lbx.selectedIndex;
	}
	set selectedIndex(value: number) {
		if (value != this.selectedIndex) {
			this._lbx.selectedIndex = value;
		}
		const text = this.getDisplayText(value);
		if (this.text != text) {
			this._setText(text, true);
		}
	}
	/**
	 * Gets or sets the value of the @see:selectedItem, obtained using the @see:selectedValuePath.
	 */
	get selectedValue(): any {
		return this._lbx.selectedValue;
	}
	set selectedValue(value: any) {
		this._lbx.selectedValue = value;
	}
	selectedIndexChanged = new Event();
	/**
	 * Raises the @see:selectedIndexChanged event.
	 */
	onSelectedIndexChanged(e?: EventArgs) {
		this._updateBtn();
		console.log("on_selected_index_changed");
		this.selectedIndexChanged.raise(this, e);
	}
	getDisplayText(index = this.selectedIndex): string {

		// get display text directly from the headerPath if that was specified
		if (this.headerPath && index > -1 && hasItems(this.collectionView)) {
			const item = this.collectionView.items[index][this.headerPath];
            let text   = item != null ? item.toString() : '';
			if (this.isContentHtml) {
				if (!this._cvt) {
					this._cvt = document.createElement('div');
				}
				this._cvt.innerHTML = text;
				text = this._cvt.textContent;
			}
			return text;
		}

		// headerPath not specified, get text straight from the ListBox
		return this._lbx.getDisplayText(index);
	}
	/**
	 * Gets or sets a value indicating whether the drop-down list displays items as plain text or as HTML.
	 */
	get isContentHtml(): boolean {
		return this._lbx.isContentHtml;
	}
	set isContentHtml(value: boolean) {
		if (value != this.isContentHtml) {
			this._lbx.isContentHtml = asBoolean(value);
			let text = this.getDisplayText();
			if (this.text != text) {
				this._setText(text, true);
			}
		}
	}
	
	get headerPath(): string {
		return this._hdrPath;
	}
	set headerPath(value: string) {
		this._hdrPath = asString(value);
		const text = this.getDisplayText();
		if (this.text != text) {
			this._setText(text, true);
		}
	}
	/**
	 * Gets the @see:ICollectionView object used as the item source.
	 */
	get collectionView(): ICollectionView {
		return this._lbx.collectionView;
	}
	
	
	////////////////////////////
		_setText(text: string, fullMatch: boolean) {
		console.log("overrided_set_text");
		
			// not while composing IME text...
		if (this._composing) return;

		// prevent reentrant calls while moving CollectionView cursor
		if (this._settingText) return;
		this._settingText = true;

		// make sure we have a string
		if (text == null) text = '';
		text = text.toString();

		// get variables we need
		let index = this.selectedIndex;
        const cv = this.collectionView;
        let start = this._getSelStart(),
            len   = -1;

		// require full match if deleting (to avoid auto-completion)
		if (this._deleting) {
			fullMatch = true;
		}

		// try autocompletion
		if (this._deleting) {
			index = this.indexOf(text, true);
		} else {
			index = this.indexOf(text, fullMatch);
			if (index < 0 && fullMatch) { // not found, try partial match
				index = this.indexOf(text, false);
			}
			if (index < 0 && start > 0) { // not found, try up to cursor
				index = this.indexOf(text.substr(0, start), false);
			}
		}

		// not found and not editable? restore old text and move cursor to matching part
		if (index < 0 && !this.isEditable && hasItems(cv) && this._oldText) {
			if (this.required || text) { // allow removing the value if not required
				index = Math.max(0, this.indexOf(this._oldText, false));
				for (let i = 0; i < text.length && i < this._oldText.length; i++) {
					if (text[i] != this._oldText[i]) {
						start = i;
						break;
					}
				}
			}
		}
		if (index > -1) {
			len = start;
			text = this.getDisplayText(index);
		}

		// update collectionView
		if (cv) {
			cv.moveCurrentToPosition(index);
		}

		// update element
		if (text != this._tbx.value) {
			this._tbx.value = text;
		}

		// update text selection
		if (len > -1 && this.containsFocus() && !this.isTouching) {
			this._setSelectionRange(len, text.length);
		}

		// call base class to fire textChanged event
		super._setText(text, fullMatch);

		// clear flags
		this._deleting = false;
		this._settingText = false;
}
indexOf(text: string, fullMatch: boolean): number {
//search for input text
		const cv = this.collectionView;
		
		if (hasItems(cv) && text) {
		
			text = text.toString().toLowerCase();
			for (let i = 0; i < cv.items.length; i++) {
			
				const t = this.getDisplayText(i).toLowerCase();
				
				if (fullMatch) {
					if (t == text) {
						return i;
					}
				} else {
					if (t.indexOf(text) == 0) {
						return i;
					}
				}
			}
		}
		return -1;
	}
// get selection start in an extra-safe way (TFS 82372)
	private _getSelStart(): number {
		return this._tbx && this._tbx.value
			? this._tbx.selectionStart
			: 0;
	}
	
	/**
	 * Gets or sets a value that enables or disables editing of the text
	 * in the input element of the @see:ComboBox (defaults to false).
	 */
	get isEditable(): boolean {
		return this._editable;
	}
	set isEditable(value: boolean) {
		this._editable = asBoolean(value);
	}
	/**
	 * Gets or sets whether the control value must be set to a non-null value
	 * or whether it can be set to null (by deleting the content of the control).
	 */
	get required(): boolean {
		return this._required;
	}
	set required(value: boolean) {
		this._required = asBoolean(value);
	}
		// set selection range in input element (if it is visible)
	private _setSelectionRange(start: number, end: number) {
		if (this._elRef == this._tbx) {
			setSelectionRange(this._tbx, start, end);
		}
	}
	// prevent dropping down with no items
	onIsDroppedDownChanging(e: CancelEventArgs): boolean {
	console.log("on_is_drop_down_changing");
	console.log("has_tems:"+hasItems(this.collectionView));
		return hasItems(this.collectionView)
			? super.onIsDroppedDownChanging(e)
			: false;
	}
	// show current selection when dropping down
	onIsDroppedDownChanged(e?: EventArgs) {
		super.onIsDroppedDownChanged(e);
		console.log("combo_box_is_dropped_down_changed:"+this.isDroppedDown);
		if (this.isDroppedDown) {
			this._lbx.showSelection();
			if (!this.isTouching) {
			console.log("select_all");
				this.selectAll();
			}
		}
		
	}
	// update button visibility and value list
	_updateBtn() {
		const cv                = this.collectionView;
		this._btn.style.display = this._showBtn && hasItems(cv) ? '' : 'none';
	}


// override to select items with the keyboard
	_keydown(e: KeyboardEvent) {

		// allow base class
		super._keydown(e);

		// if the base class handled this, we're done
		if (e.defaultPrevented) {
			return;
		}

		// if the input element is not visible, we're done (e.g. menu)
		if (this._elRef != this._tbx) {
			return;
		}

		// remember we pressed a key when handling the TextChanged event
		if (e.keyCode == Key.Back || e.keyCode == Key.Delete) {
			this._deleting = true;
		}

		// not if we have no items
		let cv = this.collectionView;
		if (!cv || !cv.items) {
			return;
		}

		// handle key
		let start = -1;
		switch (e.keyCode) {

			// select previous item (or wrap back to the last)
			case Key.Up:
				start = this._getSelStart();
				this.selectedIndex = this._findNext(this.text.substr(0, start), -1);
				this._setSelectionRange(start, this.text.length);
				e.preventDefault();
				break;

			// select next item (or wrap back to the first, or show dropdown)
			case Key.Down:
				start = this._getSelStart();
				this.selectedIndex = this._findNext(this.text.substr(0, start), +1);
				this._setSelectionRange(start, this.text.length);
				e.preventDefault();
				break;
		}
	}
	// skip to the next/previous item that starts with a given string, wrapping
	private _findNext(text: string, step: number): number {
		if (this.collectionView) {
			text = text.toLowerCase();
			const len = this.collectionView.items.length;
            let index: number,
                  t: string;
			for (let i = 1; i <= len; i++) {
				index = (this.selectedIndex + i * step + len) % len;
				t = this.getDisplayText(index).toLowerCase();
				if (t.indexOf(text) == 0) {
					return index;
				}
			}
		}
		return this.selectedIndex;
	}

	////////////////
	/////
	///// multi select
	/////
	//////////////
	get displayMemberPath(): string {
		return this._lbx.displayMemberPath;
	}
	set displayMemberPath(value: string) {
		this._lbx.displayMemberPath = value;
		const text = this.getDisplayText();
		if (this.text != text) {
			this._setText(text, true);
		}
	}

}