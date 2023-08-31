

/**
 * Base class for Array classes with notifications.
 */
export class ArrayBase {

    // based on http://stackoverflow.com/questions/14000645/how-to-extend-native-javascipt-array-in-typescript

    /**
     * Initializes a new instance of an @see:ArrayBase.
     */
    constructor() {
        this.length = 0;
        Array.apply(this, arguments);
    }

    // keep TypeScript happy (these will never be called, we changed the prototype)
    pop(): any {
        return null;
    }
    push(value: any): number {
        return 0;
    }
    splice(index: number, count: number, value?: any): any[] {
        return null;
    }
    slice(begin: number, end?: number): any[] {
        return null;
    }
    indexOf(searchElement: any, fromIndex?: number) {
        return -1;
    }
    sort(compareFn?: Function): any[]{
        return null;
    }
    reverse() {
        return null
    }
    length: number;
}

// inheriting from Array
// NOTE: set this in declaration rather than in constructor so the
// the TypeScript inheritance mechanism works correctly with instanceof.
ArrayBase.prototype = Array.prototype;
