import { DropDown } from './DropDown';
import { ListBox } from './ListBox/ListBox';
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

		// create the drop-down element
		this._lbx = new ListBox(this._dropDown);

		// limit the size of the drop-down
		/*this._lbx.maxHeight = 200;

		// update our selection when user picks an item from the ListBox
		// or when the selected index changes because the list changed
		this._lbx.selectedIndexChanged.addHandler(() => {
			this._updateBtn();
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
				this.isDroppedDown = false;
			}
		});
		*/
	}
}