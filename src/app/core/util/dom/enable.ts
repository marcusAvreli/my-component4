import {toggleClass} from "./toggle-class";

/**
 * Enables or disables an element.
 *
 * @param e Element to enable or disable.
 * @param enable Whether to enable or disable the element.
 */
export function enable(e: HTMLElement, enable: boolean) {
    if (enable) {
        e.removeAttribute('disabled');
    } else {
        e.setAttribute('disabled', 'true');
    }
    toggleClass(e, 'wj-state-disabled', !enable);
}
