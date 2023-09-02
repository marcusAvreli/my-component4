
import {ComboBox} from '../ComboBox'
import {culture} from "../../core/globalization/Localization";
import {asString} from "../../core/util/asserts/asString";
import {asNumber} from "../../core/util/asserts/asNumber";
import {asFunction} from "../../core/util/asserts/asFunction";
import {EventArgs} from "../../eventArgs/EventArgs";
//import {format} from "../../util/format";
import {Event} from "../../event/Event";


/**
 * The @see:MultiSelect control allows users to select multiple items from
 * drop-down lists that contain custom objects or simple strings.
 *
 * The @see:MultiSelect control extends @see:ComboBox, with all the usual
 * properties, including @see:itemsSource and @see:displayMemberPath.
 *
 * Like the @see:ListBox control, it has a @see:checkedMemberPath property
 * that defines the name of the property that determines whether an item is
 * checked or not.
 *
 * The items currently checked (selected) can be obtained using the
 * @see:checkedItems property.</p>
 *
 * The control header is fully customizable. By default, it shows up to two items
 * selected and the item count after that. You can change the maximum number of
 * items to display (@see:maxHeaderItems), the message shown when no items are selected
 * (@see:placeholder), and the format string used to show the item count (@see:headerFormat).
 * Or you can provide a function to generate the header content based on whatever criteria
 * your application requires (@see:headerFormatter).
 */
export class MultiSelect extends ComboBox {
    _maxHdrItems = 4;
    _hdrFmt = culture.MultiSelect.itemsSelected;
    _hdrFormatter: Function;

    static _DEF_CHECKED_PATH = '$checked';

    /**
     * Initializes a new instance of a @see:MultiSelect control.
     *
     * @param element The DOM element that hosts the control, or a selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?) {
        super(element);

        // make header element read-only
        this.inputElement.setAttribute('readonly', '');

        // toggle drop-down when clicking on the header
        this.addEventListener(this.inputElement, 'click', () => {
            this.isDroppedDown = !this.isDroppedDown;
        });

        // make listbox a multi-select
        this.checkedMemberPath = null;

        // do NOT close the drop-down when the user clicks to select an item
        this.removeEventListener(this.dropDown, 'click');

        // update header now, when the itemsSource changes, and when items are selected
        this._updateHeader();
        this.listBox.itemsChanged.addHandler(() => {
            this._updateHeader();
        });
        this.listBox.checkedItemsChanged.addHandler(() => {
            this._updateHeader();
            this.onCheckedItemsChanged();
        });

        // initialize control options
        this.initialize(options);
    }

    //** object model

    /**
     * Gets or sets the name of the property used to control the checkboxes
     * placed next to each item.
     */
    get checkedMemberPath(): string {
        const p = this.listBox.checkedMemberPath;
        return p != MultiSelect._DEF_CHECKED_PATH ? p : null;
    }
    set checkedMemberPath(value: string) {
        value = asString(value);
        this.listBox.checkedMemberPath = value ? value : MultiSelect._DEF_CHECKED_PATH;
    }
    /**
     * Gets or sets the maximum number of items to display on the control header.
     *
     * If no items are selected, the header displays the text specified by the
     * @see:placeholder property.
     *
     * If the number of selected items is smaller than or equal to the value of the
     * @see:maxHeaderItems property, the selected items are shown in the header.
     *
     * If the number of selected items is greater than @see:maxHeaderItems, the
     * header displays the selected item count instead.
     */
    get maxHeaderItems(): number {
        return this._maxHdrItems;
    }
    set maxHeaderItems(value: number) {
        if (this._maxHdrItems != value) {
            this._maxHdrItems = asNumber(value);
            this._updateHeader();
        }
    }
    /**
     * Gets or sets the format string used to create the header content
     * when the control has more than @see:maxHeaderItems items checked.
     *
     * The format string may contain the '{count}' replacement string
     * which gets replaced with the number of items currently checked.
     * The default value for this property in the English culture is
     * '{count:n0} items selected'.
     */
    get headerFormat(): string {
        return this._hdrFmt;
    }
    set headerFormat(value: string) {
        if (value != this._hdrFmt) {
            this._hdrFmt = asString(value)
            this._updateHeader();
        }
    }
    /**
     * Gets or sets a function that gets the HTML in the control header.
     *
     * By default, the control header content is determined based on the
     * @see:placeholder, @see:maxHeaderItems, and on the current selection.
     *
     * You may customize the header content by specifying a function that
     * returns a custom string based on whatever criteria your application
     * requires.
     */
    get headerFormatter(): Function {
        return this._hdrFormatter;
    }
    set headerFormatter(value: Function) {
        if (value != this._hdrFormatter) {
            this._hdrFormatter = asFunction(value);
            this._updateHeader();
        }
    }
    /**
     * Gets or sets an array containing the items that are currently checked.
     */
    get checkedItems(): any[] {
        return this.listBox.checkedItems;
    }
    set checkedItems(value: any[]) {
        this.listBox.checkedItems = value;
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

    //** implementation

    // update header when refreshing
    refresh(fullUpdate = true) {
        super.refresh(fullUpdate);
        this._updateHeader();
    }

    // give focus to list when dropping down
    onIsDroppedDownChanged(e?: EventArgs) {
        super.onIsDroppedDownChanged(e);
        if (this.isDroppedDown) {
            this.dropDown.focus();
        }
    }

    // update the value of the control header
    _updateHeader() {
        if (this._hdrFormatter) {
            this.inputElement.value = this._hdrFormatter();
        } else {

            // get selected items
            const items = this.checkedItems;

            // build header
            let hdr = '';
            if (items.length > 0) {
			console.log("==============items.length:"+items.length);
			console.log("==============items.length:"+this._maxHdrItems);
                if (items.length <= this._maxHdrItems) {
                    if (this.displayMemberPath) {
                        for (let i = 0; i < items.length; i++) {
                            items[i] = items[i][this.displayMemberPath];
                        }
                    }
                    hdr = items.join(', ');
                } else {
                  /*  hdr = format(this.headerFormat, {
                        count: items.length
                    });
					*/
                }
            }

            // set header
            this.inputElement.value = hdr;
        }
    }

    // textbox is read-only!
    _setText(text: string, fullMatch: boolean) {
        // keep existing text
    }

}