//formate date time to DAY-MONTH-YEAR string by default, or use locale if provided
export default function formatDatetimeObject(date: Date, country?: string): string {
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

//return date difference 
export const findDateDifference = (date1: Date, date2: Date): number => {
  const diff = date1.getTime() - date2.getTime();
  return Math.abs(diff / (1000 * 60 * 60 * 24));
}

