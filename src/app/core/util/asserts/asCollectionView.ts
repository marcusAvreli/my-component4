import {isArray} from "../lang/is-array";
import {ICollectionView} from "../../../collections/interface/ICollectionView";
import {tryCast} from "../../common/global";
import {assert} from "./assert";
import {CollectionView} from "../../../collections/CollectionView";
/**
 * Asserts that a value is an @see:ICollectionView or an Array.
 *
 * @param value Array or @see:ICollectionView.
 * @param nullOK Whether null values are acceptable.
 * @return The @see:ICollectionView that was passed in or a @see:CollectionView
 * created from the array that was passed in.
 */
export function asCollectionView(value: any, nullOK = true): ICollectionView {
	console.log("as_collection_view_started");
	console.log("value:"+value);
    if (value == null && nullOK) {
        return null;
    }
    const cv = tryCast(value, 'ICollectionView');
    if (cv != null) {
        return cv;
    }
    if (!isArray(value)) {
        assert(false, 'Array or ICollectionView expected.');
    }
	console.log("as_collection_view_finished");
    return new CollectionView(value);
}

