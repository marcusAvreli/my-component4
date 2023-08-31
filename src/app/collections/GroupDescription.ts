/**
 * Represents a base class for types defining grouping conditions.
 *
 * The concrete class which is commonly used for this purpose is
 * @see:PropertyGroupDescription.
 */
export class GroupDescription {

    /**
     * Returns the group name for the given item.
     *
     * @param item The item to get group name for.
     * @param level The zero-based group level index.
     * @return The name of the group the item belongs to.
     */
    public groupNameFromItem(item: any, level: number): any {
        return '';
    }
    /**
     * Returns a value that indicates whether the group name and the item name
     * match (which implies that the item belongs to the group).
     *
     * @param groupName The name of the group.
     * @param itemName The name of the item.
     * @return True if the names match; otherwise, false.
     */
    public namesMatch(groupName: any, itemName: any): boolean {
        return groupName === itemName;
    }
}