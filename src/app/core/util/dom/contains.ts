/**
 * Checks whether an HTML element contains another.
 *
 * @param parent Parent element.
 * @param child Child element.
 * @return True if the parent element contains the child element.
 */
export function contains(parent: any, child: any): boolean {
    for (let e = <Node>child; e; e = e.parentNode) {
        if (e === parent) return true;
    }
    return false;
}

export function containsFocus(e:HTMLElement):boolean{
  return contains(e, document.activeElement);
}
