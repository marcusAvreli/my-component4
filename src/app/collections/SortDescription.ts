import {Binding} from "../core/index";
/**
 * Describes a sorting criterion.
 */
export class SortDescription {
    _bnd: Binding;
    _asc: boolean;

    /**
     * Initializes a new instance of a @see:SortDescription.
     *
     * @param property Name of the property to sort on.
     * @param ascending Whether to sort in ascending order.
     */
    constructor(property: string, ascending: boolean) {
        this._bnd = new Binding(property);
        this._asc = ascending;
    }
    /**
     * Gets the name of the property used to sort.
     */
    get property(): string {
        return this._bnd.path;
    }
    /**
     * Gets a value that determines whether to sort the values in ascending order.
     */
    get ascending(): boolean {
        return this._asc;
    }
}
