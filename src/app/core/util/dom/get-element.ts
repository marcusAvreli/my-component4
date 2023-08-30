export function getElement(selector: any): HTMLElement {
    if (selector instanceof HTMLElement) return selector;
   // if (isString(selector)) return <HTMLElement>document.querySelector(selector);
    if (selector && selector.jquery) return <HTMLElement>selector[0];
    return null;
}