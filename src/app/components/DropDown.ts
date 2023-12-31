import {Component, NgModule, VERSION, Inject,Renderer2,ElementRef,ViewChild,  ComponentFactoryResolver, Injector,AfterViewInit} from '@angular/core'
import {asBoolean} from "../core/util/asserts/asBoolean";
import {CancelEventArgs} from "../eventArgs/CancelEventArgs";
import {EventArgs} from "../eventArgs/EventArgs";
import {Event} from "../event/Event"
import {setSelectionRange} from "../core/common/global";
//import {showPopup, hidePopup} from '../../core/popup'
import {Key} from "../enum/Key";
import {Control} from './Control';
import {
   
    getElement,
	addClass,
	createElement
   
} from "../core/index";
/*
@Component({
    selector: 'a-comp',
    template: `<textarea  #tasknote name="tasknote" [(ngModel)]="taskNote"> </textarea>`
})
*/
export class DropDown extends Control /*implements AfterViewInit*/ {
  name = 'A component';
    @ViewChild('tasknote') input: ElementRef;
	
	
	 static controlTemplate = '<div style="position:relative" class="wj-template">' +
        '<textarea  #tasknote name="tasknote" [(ngModel)]="taskNote"> </textarea>' +
       
        '</div>';
	
	   // child elements
    _tbx: HTMLInputElement;
    _elRef: HTMLElement;
    _btn: HTMLElement;
    _dropDown: HTMLElement;

    // property storage
    _showBtn    = true;
    _autoExpand = true;

    // private stuff
    _oldText: string;
	
	
   //constructor(element: any, options?) {
   constructor(element: any, options?) {
    super(element, null, true);
	console.log("a_component_constructor");
	 const tpl =  '<div style="position:relative" class="wj-template">' +
        '<div class="wj-input">' +
        '<div class="wj-input-group wj-input-btn-visible">' +
        '<input wj-part="input" type="text" class="wj-form-control" />' +
        '<span wj-part="btn" class="wj-input-group-btn" tabindex="-1">' +
        '<button class="wj-btn wj-btn-default" type="button" tabindex="-1">' +
        '<span class="wj-glyph-down"></span>' +
        '</button>' +
        '</span>' +
        '</div>' +
        '</div>' +
        '<div wj-part="dropdown" class="wj-content wj-dropdown-panel" ' +
        'style="display:none;position:absolute;z-index:100;width:auto">' +
        '</div>' +
        '</div>';
		//this.getTemplate();
        this.applyTemplate(
            'wj-control wj-dropdown wj-content', tpl, {
                _tbx     : 'input',
                _btn     : 'btn',
                _dropDown: 'dropdown'
            }, 'input'
        );
		
		 // set reference element (used for positioning the drop-down)
        this._elRef = this._tbx;

        // disable autocomplete (important for mobile browsers including Chrome/Android)
       this._tbx.autocomplete = 'off';

        // create drop-down element, update button display
        this._createDropDown();
		 this._updateBtn();
		  const kd = this._keydown.bind(this);
        this.addEventListener(this.hostElement, 'keydown', kd);
        this.addEventListener(this.dropDown, 'keydown', kd);
 this.addEventListener(
            this._tbx, 'input', () => {
                this._setText(this.text, false);
            }
        );
		 this.addEventListener(
            this._tbx, 'click', () => {
                if (this._autoExpand) {
                    this._expandSelection(); // expand the selection to the whole number/word that was clicked
                }
            }
        );
		
		
		
		   // IE 9 does not fire an input event when the user removes characters from input
        // filled by keyboard, cut, or drag operations.
        // https://developer.mozilla.org/en-US/docs/Web/Events/input
        // so subscribe to keyup and set the text just in case (TFS 111189)
        if (document.doctype && navigator.appVersion.indexOf('MSIE 9') > -1) {
            this.addEventListener(
                this._tbx, 'keyup', () => {
                    this._setText(this.text, false);
                }
            );
        }
		     // handle clicks on the drop-down button
        this.addEventListener(this._btn, 'click', this._btnclick.bind(this));
  // stop propagation of clicks on the drop-down element
        // (since they are not children of the hostElement, which can confuse
        // elements such as Bootstrap menus)
        this.addEventListener(
            this._dropDown, 'click', (e) => {
                e.stopPropagation();
            }
        );
    //this.renderer.selectRootElement(this.input["nativeElement"]).focus();
   }
   /*
   public ngAfterViewInit(): void {
        console.log(this.input.nativeElement);
		this.renderer.selectRootElement(this.input["nativeElement"]).focus();
		}
		*/
		
		 /**
     * Applies the template to a new instance of a control, and returns the root element.
     *
     * This method should be called by constructors of templated controls.
     * It is responsible for binding the template parts to the
     * corresponding control members.
     *
     * For example, the code below applies a template to an instance
     * of an @see:InputNumber control. The template must contain elements
     * with the 'wj-part' attribute set to 'input', 'btn-inc', and 'btn-dec'.
     * The control members '_tbx', '_btnUp', and '_btnDn' will be assigned
     * references to these elements.
     *
     * <pre>this.applyTemplate('wj-control wj-inputnumber', template, {
         *   _tbx: 'input',
         *   _btnUp: 'btn-inc',
         *   _btnDn: 'btn-dec'
         * }, 'input');</pre>
     *
     * @param classNames Names of classes to add to the control's host element.
     * @param template An HTML string that defines the control template.
     * @param parts A dictionary of part variables and their names.
     * @param namePart Name of the part to be named after the host element. This
     * determines how the control submits data when used in forms.
     */
    applyTemplate(classNames: string, template: string, parts: Object, namePart?: string): HTMLElement {
	//console.log("apply_template_started");
        const host = this._e;

        // apply standard classes to host element
        if (classNames) {
            addClass(host, classNames);
        }

        // convert string into HTML template and append to host
        let tpl = null;
        if (template) {
            tpl = createElement(template);
			
            tpl = host.appendChild(tpl);
			
        }

        // make sure the control can get the focus
        // this is a little tricky:
        // - Chrome won't give divs the focus unless we set tabIndex to something > -1
        // - But if we do set it and the control contains input elements, the back-tab key won't work
        // so we set the tabIndex to -1 or zero depending on whether the control contains input elements.
        // http://wijmo.com/topic/shift-tab-not-working-for-input-controls-in-ff-and-chrome/, TFS 123457
        if (host && !host.getAttribute('tabindex')) {
            host.tabIndex = host.querySelector('input') ? -1 : 0;
        }

        // bind control variables to template parts
        if (parts) {
            for (let part in parts) {
                const wjPart = parts[part];
				//console.log("wj-part:"+wjPart);
                this[part]   = tpl.querySelector('[wj-part="' + wjPart + '"]');

                // look in the root as well (querySelector doesn't...)
                if (this[part] == null && tpl.getAttribute('wj-part') == wjPart) {
                    this[part] = tpl;
                }

                // make sure we found the part
                if (this[part] == null) {
                    throw 'Missing template part: "' + wjPart + '"';
                }

                // copy/move attributes from host to input element
                if (wjPart == namePart) {

                    // copy parent element's name attribute to the namePart element
                    // (to send data when submitting forms).
                    let att = host.attributes['name'];
                    if (att && att.value) {
                        this[part].setAttribute('name', att.value);
                    }

                    // transfer access key
                    att = host.attributes['accesskey'];
                    if (att && att.value) {
                        this[part].setAttribute('accesskey', att.value);
                        host.removeAttribute('accesskey');
                    }
                }
            }
        }
		//console.log("apply_template_finished");
        // return template
        return tpl;
    }
	
	  _createDropDown() {
        // override in derived classes
    }
	
	   get inputElement(): HTMLInputElement {
	  // console.log("input_element");
        return this._tbx;
    }

    /**
     * Gets or sets the string shown as a hint when the control is empty.
     */
    get placeholder(): string {
	//console.log("place_holder");
        return this._tbx.placeholder;
    }

    set placeholder(value: string) {
	//console.log("place_holder");
        this._tbx.placeholder = "ssss";
    }
////////////////////////////////////////////////////////////
//
//after drop down was shown on screen
//
/////////////////////////////////////////////////////////////
 get isDroppedDown(): boolean {
		console.log("get_is_dropped_down:"+this._dropDown.style.display);
        return this._dropDown.style.display != 'none';
    }

    set isDroppedDown(value: boolean) {
		console.log("?????????????set_is_dropped_down??????????????");
		console.log("received_value:"+value);
        value = asBoolean(value) && !this.disabled;
		console.log("updated_received_value:"+value);
		//console.log("this_is_dropped_down:"+this.isDroppedDown);
		
		
        if (value != this.isDroppedDown && this.onIsDroppedDownChanging(new CancelEventArgs())) {
			//console.log("checkPost");
            //const dd = this._dropDown;
		const dd = this._dropDown;	
            if (value) {
                if (!dd.style.minWidth) {
                    dd.style.minWidth = this.hostElement.getBoundingClientRect().width + 'px';
                }
				console.log("set_display_block");
                dd.style.display = 'block';
                this._updateDropDown();
            } else {
                if (this.containsFocus()) {
                    if (!this.isTouching || !this.showDropDownButton) {
				//	console.log("show_select_all");
                       this.selectAll();
                    }
                }
				console.log("==========HIDE_POPUP============");
				   dd.style.display = 'none';
              //  hidePopup(dd);
            }
          //  this._updateFocusState();
            this.onIsDroppedDownChanged();
        }
    }
	   /**
     * Occurs before the drop down is shown or hidden.
     */
    isDroppedDownChanging = new Event();

    /**
     * Raises the @see:isDroppedDownChanging event.
     */
    onIsDroppedDownChanging(e: CancelEventArgs): boolean {
		console.log("on_is_dropped_down_changing");
        this.isDroppedDownChanging.raise(this, e);
        return !e.cancel;
    }
	
	    // update drop down content before showing it
    _updateDropDown() {
	console.log("_updateDropDown=========????===============");
        if (this.isDroppedDown) {
            this._commitText();
            //showPopup(this._dropDown, this.hostElement);
        }
    }
	 // commit the text in the value element
    _commitText() {
        // override in derived classes
    }
	    get showDropDownButton(): boolean {
		//console.log("_updateDropDown");
        return this._showBtn;
    }

    set showDropDownButton(value: boolean) {
	//console.log("_updateDropDown");
        this._showBtn = asBoolean(value);
        this._updateBtn();
    }
	
	  // update drop-down button visibility
    _updateBtn() {
        this._btn.tabIndex      = -1;
        this._btn.style.display = this._showBtn ? '' : 'none';
    }
	  // update text in textbox
    _setText(text: string, fullMatch: boolean) {

       console.log("drop_down_set_text_started");
	    // make sure we have a string
        if (text == null) text = '';
        text = text.toString();

        // update element
        if (text != this._tbx.value) {
		//console.log("_setText:"+text);
            this._tbx.value = text;
        }

        // fire change event
        if (text != this._oldText) {
            this._oldText = text;
		//	console.log("fire_on_text_changed");
            this.onTextChanged();
        }
		  console.log("drop_down_set_text_finished");
    }
	
	  get text(): string {
        return this._tbx.value;
    }

    set text(value: string) {
        if (value != this.text) {
            this._setText(value, true);
        }
    }
	
	   /**
     * Occurs when the value of the @see:text property changes.
     */
    textChanged = new Event();

    /**
     * Raises the @see:textChanged event.
     */
    onTextChanged(e?: EventArgs) {
        this.textChanged.raise(this, e);
    }
	
	 _expandSelection() {
		//console.log("expand_selection_started");
        const tbx = this._tbx,
              val = tbx.value;
        let start = tbx.selectionStart,
              end = tbx.selectionEnd;
			 // console.log("val:>>"+val+"<<");
			//  console.log("start:"+start);
			//  console.log("end:"+end);
        if (val && start == end) {
            const ct = this._getCharType(val, start);
            if (ct > -1) {
                for (; end < val.length; end++) {
                    if (this._getCharType(val, end) != ct) {
                        break;
                    }
                }
                for (; start > 0; start--) {
                    if (this._getCharType(val, start - 1) != ct) {
                        break;
                    }
                }
                if (start != end) {
				console.log("set_selection_range");
                    tbx.setSelectionRange(start, end);
                }
            }
        }
		//console.log("expand_selection_finished");
    }
	  // get the type of character (digit, letter, other) at a given position
    _getCharType(text: string, pos: number) {
        const chr = text[pos];
        if (chr >= '0' && chr <= '9') return 0;
        if ((chr >= 'a' && chr <= 'z') || (chr >= 'A' && chr <= 'Z')) return 1;
        return -1;
    }


get autoExpandSelection(): boolean {
console.log("==============auto expand");
        return this._autoExpand;
    }

    set autoExpandSelection(value: boolean) {
	console.log("==============auto expand");
        this._autoExpand = asBoolean(value);
    }

  get dropDown(): HTMLElement {
        return this._dropDown;
    }
	
	// handle keyboard events
    _keydown(e: KeyboardEvent) {
//console.log("pressed_key_down");
        // honor defaultPrevented
        if (e.defaultPrevented) return;

        // handle key
        switch (e.keyCode) {

            // close dropdown on tab, escape, enter
            case Key.Tab:
            case Key.Escape:
            case Key.Enter:
                this.isDroppedDown = false;
                break;

            // toggle drop-down on F4, alt up/down
            case Key.F4:
            case Key.Down:
            case Key.Up:
                if (e.keyCode == Key.F4 || e.altKey) {
                    this.isDroppedDown = !this.isDroppedDown;
                    if (!this.isDroppedDown) {
                        this._tbx.focus();
                    }
                    e.preventDefault();
                }
                break;
        }
    }
	  // handle clicks on the drop-down button
    _btnclick(e: MouseEvent) {
		console.log("===========CLICKED_STARTED===============");
		console.log("isDroppedDown_start:"+this.isDroppedDown);
        this.isDroppedDown = !this.isDroppedDown;
		console.log("isDroppedDown_finish:"+this.isDroppedDown);
			console.log("===========CLICKED_FINISHED===============");
    }
	
	  isDroppedDownChanged = new Event();

    /**
     * Raises the @see:isDroppedDownChanged event.
     */
    onIsDroppedDownChanged(e?: EventArgs) {
        this.isDroppedDownChanged.raise(this, e);
    }
	  selectAll() {
		console.log("select_all_started");
		console.log("_elRef:"+this._elRef);
		console.log("_tbx:"+this._tbx);
        if (this._elRef == this._tbx) {
			console.log("set_selection_range");
            setSelectionRange(this._tbx, 0, this.text.length);
        }
		console.log("select_all_finished");
    }
	
	 // reposition dropdown when refreshing
    refresh(fullUpdate = true) {
        super.refresh(fullUpdate);
console.log("this.isDroppedDown:"+this.isDroppedDown);
        // update popup/focus
        if (this.isDroppedDown) {
            if (getComputedStyle(this.hostElement).display != 'none') {
                const ae = <HTMLElement>document.activeElement;
               // showPopup(this._dropDown, this.hostElement);
                if (ae instanceof HTMLElement && ae != document.activeElement) {
                    ae.focus();
                }
            }
        }
    }

}