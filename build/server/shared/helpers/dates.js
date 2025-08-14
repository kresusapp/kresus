"use strict";
// Every function in this helper will return a new Date instance and will not alter the date passed
// in parameter.
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOfDay = startOfDay;
exports.endOfDay = endOfDay;
exports.startOfMonth = startOfMonth;
exports.endOfMonth = endOfMonth;
function startOfDay(date) {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}
function endOfDay(date) {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
}
function startOfMonth(date) {
    const newDate = new Date(date);
    // Dates are 1-indexed.
    newDate.setDate(1);
    return startOfDay(newDate);
}
function endOfMonth(date) {
    const newDate = new Date(date);
    // First set the date to the mid of the month to avoid issues
    // when the date is a day that does not exist the next month (ex: 31 june).
    newDate.setDate(15);
    // Add one month, then use 0 as date as it will shift the date to the last
    // date of the previous month.
    newDate.setMonth(newDate.getMonth() + 1);
    newDate.setDate(0);
    return endOfDay(newDate);
}
