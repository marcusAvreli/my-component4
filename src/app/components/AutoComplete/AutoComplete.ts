import {asNumber, asFunction, asString, asCollectionView} from "../../core/index";
import {ComboBox} from "../ComboBox";
import {Key} from "../../enum/Key";
import {EventArgs} from "../../eventArgs/EventArgs";


/**
 * The @see:AutoComplete control is an input control that allows callers
 * to customize the item list as the user types.
 *
 * The control is similar to the @see:ComboBox, except the item source is a
 * function (@see:itemsSourceFunction) rather than a static list. For example,
 * you can look up items on remote databases as the user types.
 *
 * The example below creates an @see:AutoComplete control and populates it using
 * a 'countries' array. The @see:AutoComplete searches for the country as the user
 * types, and narrows down the list of countries that match the current input.
 *
 * @fiddle:8HnLx
 */
export class AutoComplete extends ComboBox {

    // property storage
    private _itemsSourceFn: Function;
    private _minLength = 2;
    private _maxItems = 6;
    private _itemCount = 0;
    private _delay = 500;
    private _cssMatch: string;

    // private stuff
    private _toSearch: any;
    private _query = '';
    private _rxMatch: any;
    private _rxHighlight: any;
    private _handlingCallback = false;
    //private _itemFormatter: Function;

    /**
     * Initializes a new instance of an @see:AutoComplete control.
     *
     * @param element The DOM element that hosts the control, or a selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?) {
        super(element);
        this.isEditable = true;
        this.isContentHtml = true;
       // this.itemFormatter = this._defaultFormatter.bind(this);
        if (options) {
            this.initialize(options);
        }
    }

    //--------------------------------------------------------------------------
    //#region ** object model

    /**
     * Gets or sets the minimum input length to trigger autocomplete suggestions.
     */
    get minLength(): number {
        return this._minLength;
    }
    set minLength(value: number) {
        this._minLength = asNumber(value, false, true);
    }
    /**
     * Gets or sets the maximum number of items to display in the drop-down list.
     */
    get maxItems(): number {
        return this._maxItems;
    }
    set maxItems(value: number) {
        this._maxItems = asNumber(value, false, true);
    }
    /**
     * Gets or sets the delay, in milliseconds, between when a keystroke occurs
     * and when the search is performed.
     */
    get delay(): number {
        return this._delay;
    }
    set delay(value: number) {
        this._delay = asNumber(value, false, true);
    }
    /**
     * Gets or sets a function that provides list items dynamically as the user types.
     *
     * The function takes three parameters:
     * <ul>
     *     <li>the query string typed by the user</li>
     *     <li>the maximum number of items to return</li>
     *     <li>the callback function to call when the results become available</li>
     * </ul>
     *
     * For example:
     * <pre>
     * autoComplete.itemsSourceFunction = function (query, max, callback) {
         *   // get results from the server
         *   var params = { query: query, max: max };
         *   $.getJSON('companycatalog.ashx', params, function (response) {
         *     // return results to the control
         *     callback(response);
         *   });
         * };
     * </pre>
     */
	 
  //  get itemsSourceFunction((): (...args) =>{});
    get itemsSourceFunction(): Function {
        return this._itemsSourceFn;
    }
  //  set itemsSourceFunction(value: (...args) => {});
    set itemsSourceFunction(value: Function) {
        this._itemsSourceFn = asFunction(value);
    }
	
    /**
     * Gets or sets the name of the css class used to highlight any parts
     * of the content that match the search terms.
     *
     * By default, this property is set to null, which causes the matching
     * terms to be shown in bold. You can set it to the name of a css class
     * to change the way the matches are displayed.
     *
     * The example below shows how you could use a specific css class called
     * 'match' to highlight the matches:
     *
     * <pre>
     * &lt;!-- css style for highlighting matches --&gt;
     * .match {
         *   background-color: yellow;
         *   color:black;
         * }
     * // assign css style to cssMatch property
     * autoComplete.cssMatch = 'match';
     * </pre>
     */
    get cssMatch(): string {
        return this._cssMatch;
    }
    set cssMatch(value: string) {
        this._cssMatch = asString(value);
    }

    //#endregion ** object model

    //--------------------------------------------------------------------------
    //#region ** overrides

    // override to make up/down keys work properly
    _keydown(e: KeyboardEvent) {
        if (!e.defaultPrevented && this.isDroppedDown) {
            switch (e.keyCode) {
                case Key.Up:
                case Key.Down:
                    this.selectAll();
                    break;
            }
        }
        super._keydown(e);
    }

    // update text in textbox
    _setText(text: string) {
		console.log("auto_complete_set_text");
        // don't call base class (to avoid autocomplete)

        // don't do this while handling the itemsSourcefunction callback
        if (this._handlingCallback) {
            return;
        }

        // resetting...
        if (!text && this.selectedIndex > -1) {
            this.selectedIndex = -1;
        }

        // raise textChanged
        if (text != this._oldText) {

            // assign only if necessary to prevent occasionally swapping chars (Android 4.4.2)
            if (this._tbx.value != text) {
                this._tbx.value = text;
            }
            this._oldText = text;
			console.log("before_call_on_text_changed");
            this.onTextChanged();

            // no text? no filter...
            if (!text && this.collectionView) {
             //   this.collectionView.filter = this._query = null;
                this.isDroppedDown = false;
                return;
            }
        }
console.log("this.isDroppedDown:"+this.isDroppedDown);
        // update list when user types in some text
        if (this._toSearch) {
			console.log("================before_clear_timeout============");
            clearTimeout(this._toSearch);
        }
        if (text != this.getDisplayText()) {

            // get new search terms on a timeOut (so the control doesn't update too often)
            this._toSearch = setTimeout(() => {
                this._toSearch = null;

                // get search terms
                let terms = this.text.trim().toLowerCase();
                if (terms.length >= this._minLength && terms != this._query) {

                    // save new search terms
                    this._query = terms;

                    // escape regex characters in the terms string
                    terms = terms.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

                    // build regular expressions for searching and highlighting the items
                    this._rxMatch = new RegExp('(?=.*' + terms.replace(/ /g, ')(?=.*') + ')', 'ig');
                    this._rxHighlight = new RegExp('(' + terms.replace(/ /g, '|') + ')', 'ig');

                    // update list
                    //this.isDroppedDown = false;
					
                    if (this.itemsSourceFunction) {
					console.log("before_itemsSourceFunction");
                        this.itemsSourceFunction(terms, this.maxItems, this._itemSourceFunctionCallback.bind(this));
                    } else {
						console.log("before_update_items");
                        this._updateItems();
                    }
					
                }
            }, this._delay);
        }
    }

    // populate list with results from itemSourceFunction
    _itemSourceFunctionCallback(result) {

        // update the itemsSource
        this._handlingCallback = true;
        const cv = asCollectionView(result);
        if (cv) {
            cv.moveCurrentToPosition(-1);
        }
        this.itemsSource = cv;
        this.isDroppedDown = true;
        this._handlingCallback = false;

        // refresh to update the drop-down position
        this.refresh();
    }

    // closing the drop-down: commit the change
    onIsDroppedDownChanged(e?: EventArgs) {
		console.log("================on_is_dropped_down_changed");
        // do not call super because it selects the whole text, and we don't
        // want to do that while the user is typing
        //super.onIsDroppedDownChanged(e);
        this.isDroppedDownChanged.raise(this, e);

        // select the whole text only if we have a selected item
        this._query = '';
        if (this.selectedIndex > -1) {
            this._setText(this.getDisplayText());
            if (!this.isTouching) {
                this.selectAll();
            }
        } else if (!this.isTouching) { // TFS 128884
            this._tbx.focus();
        }
    }

    //#endregion ** overrides

    //--------------------------------------------------------------------------
    //#region ** implementation

    // apply the filter to show only the matches
    _updateItems() {
        const cv = this.collectionView;
        if (cv) {

            // apply the filter
            this._handlingCallback = true;
            cv.beginUpdate();
            this._itemCount = 0;
            cv.filter = this._filter.bind(this);
            cv.moveCurrentToPosition(-1);
            cv.endUpdate();
            this._handlingCallback = false;

            // show/hide the drop-down
            this.isDroppedDown = cv.items.length > 0 && this.containsFocus();
			// this.isDroppedDown  = true;
			console.log("this.isDroppedDown:"+this.isDroppedDown);
			console.log("cv.items.length:"+cv.items.length);
			console.log("this.containsFocus():"+this.containsFocus());
            if (cv.items.length == 0 && !this.isEditable) { // honor isEditable: TFS 81936
			console.log("selectedIndex selectedIndex:");
			
                this.selectedIndex = -1;
            }

            // refresh to update the drop-down position
            this.refresh();
        }
    }

    // filter the items and show only the matches
    _filter(item: any): boolean {
console.log("=======filter the items and show only the matches============");
        // honor maxItems
        if (this._itemCount >= this._maxItems) {
            return false;
        }

        // apply filter to item
        /*if (this.displayMemberPath) {
            item = item[this.displayMemberPath];
        }
		*/
        //const text = item != null ? item.toString() : '';
		const text = item ;
console.log("======item:================:"+item);
        // count matches
        if (this._rxMatch.test(text)) {
            this._itemCount++;
			console.log("count_matches"+this._itemCount);
            return true;
        }

        // no pass
        return false;
    }

    // default item formatter: show matches in bold
    _defaultFormatter(index: number, text: string) {
        let r = '<b>$1</b>';
        if (this._cssMatch) {
            r = '<span class=' + this._cssMatch + '>$1</span>';
        }
        return text.replace(this._rxHighlight, r);
    }

    //#endregion ** implementation
}