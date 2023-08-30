
export function isDate(value: any): boolean {
    return value instanceof Date && !isNaN(value.valueOf());
}
