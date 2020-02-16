// Every function in this helper will return a new Date instance and will not alter the date passed
// in parameter.

export function startOfDay(date) {
    let newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}

export function endOfDay(date) {
    let newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
}

export function startOfMonth(date) {
    let newDate = new Date(date);
    // Dates are 1-indexed.
    newDate.setDate(1);
    return startOfDay(newDate);
}

export function endOfMonth(date) {
    let newDate = new Date(date);
    // Using 0 as date will shift the date to the last date of the previous month.
    newDate.setMonth(newDate.getMonth() + 1);
    newDate.setDate(0);
    return endOfDay(newDate);
}
