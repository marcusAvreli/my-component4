import {isArray} from "../..//util/lang/is-array";
import {isDate} from "../../util/lang/is-date";
import {culture} from "../../globalization/Localization";
/**
 * Provides date and time utilities.
 */
export class DateTime {

    /**
     * Gets a new Date that adds the specified number of days to a given Date.
     *
     * @param value Original date.
     * @param days Number of days to add to the given date.
     */
    static addDays(value: Date, days: number): Date {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate() + days);
    }
    /**
     * Gets a new Date that adds the specified number of months to a given Date.
     *
     * @param value Original date.
     * @param months Number of months to add to the given date.
     */
    static addMonths(value: Date, months: number): Date {
        return new Date(value.getFullYear(), value.getMonth() + months, value.getDate());
    }
    /**
     * Gets a new Date that adds the specified number of years to a given Date.
     *
     * @param value Original date.
     * @param years Number of years to add to the given date.
     */
    static addYears(value: Date, years: number): Date {
        return new Date(value.getFullYear() + years, value.getMonth(), value.getDate());
    }
    /**
     * Gets a new Date that adds the specified number of hours to a given Date.
     *
     * @param value Original date.
     * @param hours Number of hours to add to the given date.
     */
    static addHours(value: Date, hours: number): Date {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate(), value.getHours() + hours);
    }
    /**
     * Gets a new Date that adds the specified number of minutes to a given Date.
     *
     * @param value Original date.
     * @param minutes Number of minutes to add to the given date.
     */
    static addMinutes(value: Date, minutes: number): Date {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate(), value.getHours(), value.getMinutes() + minutes);
    }
    /**
     * Gets a new Date that adds the specified number of seconds to a given Date.
     *
     * @param value Original date.
     * @param seconds Number of seconds to add to the given date.
     */
    static addSeconds(value: Date, seconds: number): Date {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate(), value.getHours(), value.getMinutes(), value.getSeconds() + seconds);
    }
    /**
     * Returns true if two Date objects refer to the same date (ignoring time).
     *
     * @param d1 First date.
     * @param d2 Second date.
     */
    static sameDate(d1: Date, d2: Date): boolean {
        return isDate(d1) && isDate(d2) &&
            d1.getFullYear() == d2.getFullYear() &&
            d1.getMonth() == d2.getMonth() &&
            d1.getDate() == d2.getDate();
    }
    /**
     * Returns true if two Date objects refer to the same time (ignoring date).
     *
     * @param d1 First date.
     * @param d2 Second date.
     */
    static sameTime(d1: Date, d2: Date): boolean {
        return isDate(d1) && isDate(d2) &&
            d1.getHours() == d2.getHours() &&
            d1.getMinutes() == d2.getMinutes() &&
            d1.getSeconds() == d2.getSeconds();
    }
    /**
     * Returns true if two Date objects refer to the same date and time.
     *
     * @param d1 First date.
     * @param d2 Second date.
     */
    static equals(d1: Date, d2: Date): boolean {
        return isDate(d1) && isDate(d2) && d1.getTime() == d2.getTime();
    }
    /**
     * Gets a Date object with the date and time set on two Date objects.
     *
     * @param date Date object that contains the date (day/month/year).
     * @param time Date object that contains the time (hour:minute:second).
     */
    static fromDateTime(date: Date, time: Date): Date {
        if (!date && !time) return null;
        if (!date) date = time;
        if (!time) time = date;
        return new Date(
            date.getFullYear(), date.getMonth(), date.getDate(),
            time.getHours(), time.getMinutes(), time.getSeconds());
    }
    /**
     * Converts a calendar date to a fiscal date using the current culture.
     *
     * @param date Calendar date.
     * @param govt Whether to use the government or corporate fiscal year.
     */
    static toFiscal(date: Date, govt: boolean) {
        const cal = culture.Globalize.calendar;
        return isArray(cal.fiscalYearOffsets)
            ? DateTime.addMonths(date, -cal.fiscalYearOffsets[govt ? 0 : 1])
            : date;
    }
    /**
     * Converts a fiscal year date to a calendar date using the current culture.
     *
     * @param date Fiscal year date.
     * @param govt Whether to use the government or corporate fiscal year.
     */
    static fromFiscal(date: Date, govt: boolean) {
        const cal = culture.Globalize.calendar;
        return isArray(cal.fiscalYearOffsets)
            ? DateTime.addMonths(date, +cal.fiscalYearOffsets[govt ? 0 : 1])
            : date;
    }
    /**
     * Creates a copy of a given Date object.
     *
     * @param date Date object to copy.
     */
    static clone(date: Date): Date {
        return DateTime.fromDateTime(date, date);
    }
}