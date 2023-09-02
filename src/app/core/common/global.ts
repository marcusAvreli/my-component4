//import {Binding} from "./Binding";
//import {Rectangle} from "./ui/Rectangle";
//import {isFunction, isString,     } from "../util/util";
import {isFunction, isString, asType, contains, asNumber, isBoolean, isNumber} from "../util/util";
//import {Aggregate} from "../../../enum/Aggregate";
import {ICollectionView} from "../../collections/interface/ICollectionView";




/**
 * Allows callers to verify whether an object implements an interface.
 */
 /*
export interface IQueryInterface {
    /**
     * Returns true if the object implements a given interface.
     *
     * @param interfaceName Name of the interface to look for.
     
    implementsInterface(interfaceName: string): boolean;
}


*/
export function setSelectionRange(e: HTMLInputElement, start: number, end = start) {
    e = asType(e, HTMLInputElement);
    if (contains(document.body, e) && !e.disabled && e.style.display != 'none') {
        try {
            e.setSelectionRange(asNumber(start), asNumber(end));
            e.focus(); // needed in Chrome (TFS 124102)
        } catch (x) { }
    }
}

/**
 * Casts a value to a type if possible.
 *
 * @param value Value to cast.
 * @param type Type or interface name to cast to.
 * @return The value passed in if the cast was successful, null otherwise.
 */
export function tryCast(value: any, type: any): any {

    // null doesn't implement anything
    if (value == null) {
        return null;
    }

    // test for interface implementation (IQueryInterface)
    if (isString(type)) {
        return isFunction(value.implementsInterface) && value.implementsInterface(type) ? value : null;
    }

    // regular type test
    return value instanceof type ? value : null;
}



/**
 * Checks whether an @see:ICollectionView is defined and not empty.
 *
 * @param value @see:ICollectionView to check.
 */
 
export function hasItems(value: ICollectionView) {
    return value && value.items && value.items.length;
}






/**
 * Sets the start and end positions of a selection in a text field.
 *
 * This method is similar to the native @see:setSelectionRange method
 * in HTMLInputElement objects, except it checks for conditions that
 * may cause exceptions (element not in the DOM, disabled, or hidden).
 *
 * @param e
 * @param start Offset into the text field for the start of the selection.
 * @param end Offset into the text field for the end of the selection.
 */
 /*
export function setSelectionRange(e: HTMLInputElement, start: number, end = start) {
    e = asType(e, HTMLInputElement);
    if (contains(document.body, e) && !e.disabled && e.style.display != 'none') {
        try {
            e.setSelectionRange(asNumber(start), asNumber(end));
            e.focus(); // needed in Chrome (TFS 124102)
        } catch (x) { }
    }
}
*/
// ** jQuery replacement methods

/**
 * Gets the bounding rectangle of an element in page coordinates.
 *
 * This is similar to the <b>getBoundingClientRect</b> function,
 * except that uses window coordinates, which change when the
 * document scrolls.
 */
 /*
export function getElementRect(e: Element): Rectangle {
    const rc = e.getBoundingClientRect();
    return new Rectangle(rc.left + window.pageXOffset, rc.top + window.pageYOffset, rc.width, rc.height);
}

*/



/**
 * Calculates an aggregate value from the values in an array.
 *
 * @param aggType Type of aggregate to calculate.
 * @param items Array with the items to aggregate.
 * @param binding Name of the property to aggregate on (in case the items are not simple values).
 */
 /*
export function getAggregate(aggType: Aggregate, items: any[], binding?: string) {
    let cnt   = 0,
        cntn  = 0,
        sum   = 0,
        sum2  = 0,
        min   = null,
        max = null;
    const bnd = binding ? new Binding(binding) : null;

    // calculate aggregate
    for (let i = 0; i < items.length; i++) {

        // get item/value
        let val = items[i];
        if (bnd) {
            val = bnd.getValue(val);
            //assert(!isUndefined(val), 'item does not define property "' + binding + '".');
        }

        // aggregate
        if (val != null) {
            cnt++;
            if (min == null || val < min) {
                min = val;
            }
            if (max == null || val > max) {
                max = val;
            }
            if (isNumber(val) && !isNaN(val)) {
                cntn++;
                sum += val;
                sum2 += val * val;
            } else if (isBoolean(val)) {
                cntn++;
                if (val == true) {
                    sum++;
                    sum2++;
                }
            }
        }
    }

    // return result
    const avg = cntn == 0 ? 0 : sum / cntn;
    switch (aggType)
    {
        case Aggregate.Avg:
            return avg;
        case Aggregate.Cnt:
            return cnt;
        case Aggregate.Max:
            return max;
        case Aggregate.Min:
            return min;
        case Aggregate.Rng:
            return max - min;
        case Aggregate.Sum:
            return sum;
        case Aggregate.VarPop:
            return cntn <= 1 ? 0 : sum2 / cntn - avg * avg;
        case Aggregate.StdPop:
            return cntn <= 1 ? 0 : Math.sqrt(sum2 / cntn - avg * avg);
        case Aggregate.Var:
            return cntn <= 1 ? 0 : (sum2 / cntn - avg * avg) * cntn / (cntn - 1);
        case Aggregate.Std:
            return cntn <= 1 ? 0 : Math.sqrt((sum2 / cntn - avg * avg) * cntn / (cntn - 1));
    }

    // should never get here...
    throw 'Invalid aggregate type.';
}
*/