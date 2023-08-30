import {hasClass} from "./has-class";


/**
 * Adds a class to an element.
 *
 * @param e Element that will have the class added.
 * @param className Class to add to the element.
 */
export function addClass(e: HTMLElement, className: string) {
    // note: using e.getAttribute('class') instead of e.classNames
    // so this works with SVG as well as regular HTML elements.
    if (e && e.setAttribute && !hasClass(e, className)) {
        const cn = e.getAttribute('class');
        e.setAttribute('class', cn ? cn + ' ' + className : className);
    }
}
