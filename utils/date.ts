export const dateUnits = Object.freeze({
  d: 'day',
  day: 'day',
  days: 'day',
  w: 'week',
  week: 'week',
  weeks: 'week',
  m: 'month',
  mon: 'month',
  month: 'month',
  months: 'month',
  y: 'year',
  year: 'year',
  years: 'year',
  h: 'hour',
  hour: 'hour',
  hours: 'hour',
  min: 'minute',
  minute: 'minute',
  minutes: 'minute',
  s: 'second',
  sec: 'second',
  second: 'second',
  seconds: 'second',

});


//formate date time to DAY-MONTH-YEAR string by default, or use locale if provided
/**
 * The above TypeScript code includes functions for formatting datetime objects, finding date
 * differences, and manipulating dates.
 * @param {string | Date} date - The `date` parameter in the functions refers to a JavaScript `Date`
 * object representing a specific date and time. It can be passed as an argument when calling the
 * functions to perform operations like formatting, finding date differences, or adding time units to
 * the date.
 * @param {number} value - The `value` parameter in the `addToDate` function represents the amount by
 * which you want to increment the date. It is a number that specifies how many units of the specified
 * time unit (day, week, month) you want to add to the given date.
 * @param {string} unit - The `unit` parameter in the `addToDate` function represents the time unit by
 * which you want to add a value to the date. It can be 'day' or 'days' for adding days, 'week' or
 * 'weeks' for adding weeks, and 'month' or 'months
 * @returns The code snippet provided contains several functions related to date and string
 * manipulation. Here is a summary of what each function does:
 */
export function formatDatetimeObject(date: Date, country?: string): string {
  if (country) {
    const locale = country.startsWith('en-') ? country : `en-${country}`; 
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Intl.DateTimeFormat(locale, options).format(date);
  } else {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}

/**
 * The function `findDateDifference` calculates the difference in days between two given dates.
 * @param {Date} date1 - The `date1` parameter is the first date for which you want to calculate the
 * difference.
 * @param {Date} date2 - The `date2` parameter in the `findDateDifference` function represents the
 * second date that you want to find the difference from.
 * @returns The `findDateDifference` function returns the difference in days between two dates (`date1`
 * and `date2`).
 */
//return date difference 
export const findDateDifference = (date1: Date, date2: Date): number => {
  const diff = date1.getTime() - date2.getTime();
  return Math.round(Math.abs(diff / (1000 * 60 * 60 * 24)));
}


export function removeLastCharIf(str: string, char: string) {
  return str.endsWith(char) ? str.slice(0, -1) : str;
}

/**
 * The function `addToDate` adds a specified value of days, weeks, or months to a given date.
 * @param {string | Date} date - The `date` parameter can be either a string or a Date object
 * representing the starting date to which you want to add a certain value.
 * @param {number} value - The `value` parameter in the `addToDate` function represents the amount by
 * which you want to increment the date. It is a number that specifies the quantity of units you want
 * to add to the date.
 * @param unit - The `unit` parameter in the `addToDate` function represents the time unit by which you
 * want to add a value to the given date. It can be one of the following options: 'day', 'days',
 * 'week', 'weeks', 'month', or 'months'.
 * @returns The function `addToDate` returns a `Date` object that represents the updated date after
 * adding the specified value and unit.
 */
export function addToDate(date: string | Date, value: number, unit: keyof typeof dateUnits): Date {
  const newDate = new Date(date);
  switch (unit.toLowerCase()) {
    case 'day':
    case 'days':
      newDate.setDate(newDate.getDate() + value);
      break;
    case 'week':
    case 'weeks':
      newDate.setDate(newDate.getDate() + value * 7);
      break;
    case 'month':
    case 'months':
      newDate.setMonth(newDate.getMonth() + value);
      break;
  }
  return newDate;
}
export type DateInput = string | Date | { iso: string } | { interval: string };


/** Util function that parse interval string retrieved from postgresql interval data type into number and unit 
 * The `parseIntervalStr` function in TypeScript parses a string representing a time interval into a
 * numeric value and a corresponding unit.
 * @param {string} interval - The `interval` parameter is a string representing a time interval in the
 * format "number unit", where:
 * @returns The `parseIntervalStr` function returns a tuple containing a number and a string.
 */
const parseIntervalStr = (interval: string): [number, string] => {
  // Remove any leading or trailing whitespace
  interval = interval.trim();

  // Split the interval into number and unit parts
  const parts = interval.split(/\s+/);
  
  if (parts.length !== 2) {
    throw new Error('Invalid interval format. Expected "number unit"');
  }

  const number = parseFloat(parts[0]);
  const unitKey = parts[1].toLowerCase();

  if (isNaN(number)) {
    throw new Error('Invalid number in interval');
  }

  if (!(unitKey in dateUnits)) {
    throw new Error('Invalid unit in interval');
  }

  const unit = dateUnits[unitKey as keyof typeof dateUnits];

  return [number, unit];
}


/**
 * The function `calculateIntervals` takes an interval string, start date, and end date, calculates the
 * cycle count based on the interval, and generates due dates within the specified range.
 * @param {string} interval - The `interval` parameter is a string that represents the duration of each
 * interval. It should be in the format of "{number} {unit}", where `{number}` is the number of units
 * in each interval and `{unit}` is the unit of time (e.g., "1 day", "2
 * @param {Date} startDate - The `startDate` parameter is the date from which the intervals will start.
 * If no `startDate` is provided, the current date and time will be used as the default start date.
 * @param {Date | string | null | undefined} endDate - The `endDate` parameter in the
 * `calculateIntervals` function is the date until which you want to calculate the intervals. It can be
 * provided as a `Date` object, a string in a valid date format, `null`, or `undefined`. If `endDate`
 * is not provided, it
 * @returns The `calculateIntervals` function returns an array of sorted Date objects representing
 * intervals based on the provided interval string, start date, and end date. If an error occurs during
 * the calculation, an empty array is returned.
 */
export function calculateIntervals(
  interval: string,
  startDate: Date = new Date(),
  endDate: Date | string | null | undefined = undefined,
): Date[] {
  try {
    // Parse interval string into number and unit
    
    const [number, unit] = parseIntervalStr(interval);

/* This part of the code snippet is calculating the `cycleCount` based on the provided `interval`,
`startDate`, and `endDate`. Here's a breakdown of what it does: */
    const cycleCount = Math.ceil(
      (new Date(endDate ?? new Date()).getTime() - new Date(startDate).getTime()) /
      (parseInt(number.toString()) * (unit.startsWith('day') ? 86400000 : unit.startsWith('week') ? 604800000 : 2592000000))
    );

    // Generate due dates for tasks
    const dueDates: Date[] = [];
    for (let cycle = 0; cycle < cycleCount; cycle++) {
      const offset = cycle * parseInt(number.toString(), 10);
      const anchorDate = new Date(startDate ?? new Date());
      dueDates.push(addToDate(anchorDate, offset, unit as keyof typeof dateUnits));
    }
    const sortedDates = dueDates.sort((a, b) => a.getTime() - b.getTime());
    return sortedDates;
  } catch (e) {
    console.error(e);
    return [];
  }
}
