import {hasClass} from "./has-class";


/**
 * Removes a class from an element.
 *
 * @param e Element that will have the class removed.
 * @param className Class to remove form the element.
 */
export function removeClass(e: HTMLElement, className: string) {
    // note: using e.getAttribute('class') instead of e.classNames
    // so this works with SVG as well as regular HTML elements.
    if (e && e.setAttribute && hasClass(e, className)) {
        const rx = new RegExp('\\s?\\b' + className + '\\b', 'g'),
              cn = e.getAttribute('class');
        e.setAttribute('class', cn.replace(rx, ''));
    }
}
