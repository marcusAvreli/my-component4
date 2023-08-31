import {removeClass} from "./remove-class";
import {addClass} from "./add-class";


/**
 * Adds or removes a class to or from an element.
 *
 * @param e Element that will have the class added.
 * @param className Class to add or remove.
 * @param addOrRemove Whether to add or remove the class.
 * Use true to add class to element and false to remove class from element.
 */
export function toggleClass(e: HTMLElement, className: string, addOrRemove: boolean) {
    if (addOrRemove) {
        addClass(e, className);
    } else {
        removeClass(e, className);
    }
}
