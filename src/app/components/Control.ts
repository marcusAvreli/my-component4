import {
   asType,
   contains,
    getElement,
	addClass,
	createElement,
	copy,
	enable,
	asBoolean
   
} from "../core/index";

export class Control {
    private static _DATA_KEY = 'wj-Control';    // key used to store control reference in host element
    private static _REFRESH_INTERVAL = 10;      // interval between invalidation and refresh
    private static _wme: HTMLElement;           // watermark element
    static _touching: boolean;                  // the current event is a touch event
 // private static _wme: HTMLElement;           // watermark element
  //  private _updating = 0;                      // update count (no refreshes while > 0)
  public _e: HTMLElement;                    // host element
    private _focus = false;                     // whether the control currently contains the focus
    private _updating = 0;                      // update count (no refreshes while > 0)
    private _fullUpdate = false;                // in case there are multiple calls to invalidate(x)
    private _toInv: number;                     // invalidation timeOut
   private _orgOuter: string;                  // host element's original outerHTML
    private _orgInner: string;                  // host element's original innerHTML
    private _listeners;                         // list of event listeners attached to this control
    /**
     * Initializes a new instance of a @see:Control and attaches it to a DOM element.
     *
     * @param element The DOM element that will host the control, or a selector for the host element (e.g. '#theCtrl').
     * @param options JavaScript object containing initialization data for the control.
     * @param invalidateOnResize Whether the control should be invalidated when it is resized.
     */
    constructor(element: any, options = null, invalidateOnResize = false) {

        // check that the element is not in use
       // assert(Control.getControl(element) == null, 'Element is already hosting a control.');

        // get the host element
        let host = getElement(element);
       // assert(host != null, 'Cannot find the host element.');

        // save host and original content (to restore on dispose)
        this._orgOuter = host.outerHTML;
        this._orgInner = host.innerHTML;
	console.log("host.outerHTML:"+host.outerHTML);
	console.log("host.outerHTML:"+host.innerHTML);
         this._e = host;
        host[Control._DATA_KEY] = this;

    }

    /**
     * Gets the HTML template used to create instances of the control.
     *
     * This method traverses up the class hierarchy to find the nearest ancestor that
     * specifies a control template. For example, if you specify a prototype for the
     * @see:ComboBox control, it will override the template defined by the @see:DropDown
     * base class.
     */
    getTemplate(): string {
       
	for (let p = Reflect.getPrototypeOf(this); p; p = Reflect.getPrototypeOf(p)) {

            const tpl = "sdfsdfds";
			var inherits = Object.create(p);
			//this.controlTemplate;
			// reflector.annotations(p.constructor);
			console.log("inherits:"+JSON.stringify(inherits.controlTemplate));
			console.log("Reflect.getPrototypeOf(p):"+JSON.stringify(Reflect.getPrototypeOf(p)));
			console.log("Reflect.getPrototypeOf(p):"+JSON.stringify((p)));
			console.log("Reflect.getPrototypeOf(p):"+JSON.stringify(Reflect.get(this,'name')));
			//console.log("Reflect.getPrototypeOf(p):"+Reflect.getPrototypeOf(p).__proto__);
			console.log("p.constructor:"+p.constructor);
			console.log(Reflect.get(this, 'controlTemplate'));
					return "sdfsdfds";
        }

       return null;
    }
	
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
	 
	 
	   initialize(options: any) {
        if (options) {
            this.beginUpdate();
            copy(this, options);
            this.endUpdate();
        }
    }
	applyTemplate(classNames: string, template: string, parts: Object, namePart?: string): HTMLElement {
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

        // return template
        return tpl;
    }
	 /**
     * Suspends notifications until the next call to @see:endUpdate.
     */
    beginUpdate() {
        this._updating++;
    }
	/**
     * Gets the DOM element that is hosting the control.
     */
    get hostElement(): HTMLElement {
        return this._e;
    }
    /**
     * Resumes notifications suspended by calls to @see:beginUpdate.
     */
    endUpdate() {
        this._updating--;
        if (this._updating <= 0) {
            this.invalidate();
        }
    }
	invalidate(fullUpdate = true) {
	console.log("=================hello=================");
        /*this._fullUpdate = this._fullUpdate || fullUpdate;
        if (this._toInv) {
            clearTimeout(this._toInv);
            this._toInv = null;
        }
        if (!this.isUpdating) {
            this._toInv = setTimeout(() => {
                this.refresh(this._fullUpdate);
            }, Control._REFRESH_INTERVAL);
        }
		*/
    }
	
	  containsFocus(): boolean {
	console.log("contains_focus===========");
        // test for disposed controls
        if (!this._e) {
            return false;
        }

        // scan child controls (they may have popups, TFS 112676)
        const c = this._e.getElementsByClassName('wj-control');
        for (let i = 0; i < c.length; i++) {
            const ctl = Control.getControl(c[i]);
            if (ctl && ctl != this && ctl.containsFocus()) {
				console.log("returning_true_0");
                return true;
            }
        }

        // check for actual HTML containment
        //return contains(this._e, <HTMLElement>document.activeElement);
		console.log("returning_true_1");
		return false;
    }
	 /**
     * Gets the control that is hosted in a given DOM element.
     *
     * @param element The DOM element that is hosting the control, or a selector for the host element (e.g. '#theCtrl').
     */
    static getControl(element: any): Control {
        const e = getElement(element);
        return e ? asType(e[Control._DATA_KEY], Control, true) : null;
    }
	
	////////////////////////////////////////////////////////////
//
//after drop down was shown on screen
//
/////////////////////////////////////////////////////////////
	
	get disabled(): boolean {
        return this._e && this._e.getAttribute('disabled') != null;
    }
    set disabled(value: boolean) {
        value = asBoolean(value, true);
        if (value != this.disabled) {
            enable(this._e, !value);
        }
    }
	
	 get isTouching(): boolean {
        return Control._touching;
    }
	
	    addEventListener(target: EventTarget, type: string, fn: any, capture = false) {
            if (target) {
                target.addEventListener(type, fn, capture);
                if (this._listeners == null) {
                    this._listeners = [];
                }
                this._listeners.push({ target: target, type: type, fn: fn, capture: capture });
            }
        }
   }