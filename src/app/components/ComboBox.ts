import { DropDown } from './DropDown';
import { ListBox } from './ListBox/ListBox';
import {EventArgs} from "../eventArgs/EventArgs";
import {Event} from "../event/Event";
import {hasItems} from "../core/common/global";
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

		// disable auto-expand by default
		//this.autoExpandSelection = false;
		console.log("constructor_combo");
		this.initialize(options);
}

	set itemsSource(value: any) {
		console.log("set_items");
		this._lbx.itemsSource = value;
		//this._updateBtn();
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
			this.selectedIndex = this._lbx.selectedIndex;
			this.onSelectedIndexChanged();
		});
/*
		// update button display when item list changes
		this._lbx.itemsChanged.addHandler(() => {
			this._updateBtn();
		});

		// close the drop-down when the user clicks to select an item
		this.addEventListener(this._dropDown, 'click', (e: MouseEvent) => {
			if (e.target != this._dropDown) { // an item, not the list itself...
				this.isDroppedDown = false;
			}
		});
		*/
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
	selectedIndexChanged = new Event();
	/**
	 * Raises the @see:selectedIndexChanged event.
	 */
	onSelectedIndexChanged(e?: EventArgs) {
		this._updateBtn();
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
}