"use strict";
// Every function in this helper will return a new Date instance and will not alter the date passed
// in parameter.
Object.defineProperty(exports, "__esModule", { value: true });
exports.endOfMonth = exports.startOfMonth = exports.endOfDay = exports.startOfDay = void 0;
function startOfDay(date) {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}
exports.startOfDay = startOfDay;
function endOfDay(date) {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
}
exports.endOfDay = endOfDay;
function startOfMonth(date) {
    const newDate = new Date(date);
    // Dates are 1-indexed.
    newDate.setDate(1);
    return startOfDay(newDate);
}
exports.startOfMonth = startOfMonth;
function endOfMonth(date) {
    const newDate = new Date(date);
    // Using 0 as date will shift the date to the last date of the previous month.
    newDate.setMonth(newDate.getMonth() + 1);
    newDate.setDate(0);
    return endOfDay(newDate);
}
exports.endOfMonth = endOfMonth;
