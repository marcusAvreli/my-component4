/**
 * Creates an element from an HTML string.
 *
 * @param html HTML fragment to convert into an HTMLElement.
 * @return The new element.
 */
export function createElement(html: string) : HTMLElement {
    const div     = document.createElement('div');
    div.innerHTML = html;
    return <HTMLElement>div.removeChild(div.firstChild);
}
