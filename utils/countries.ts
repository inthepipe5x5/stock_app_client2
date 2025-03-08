import { Float } from "react-native/Libraries/Types/CodegenTypes";

const COUNTRIES_API = process.env.EXPO_COUNTRIES_API || 'https://restcountries.com/v3.1/all';

/**
 * Interface representing the structure of a language object.
 */
interface Language {
  [key: string]: string;
}

/**
 * Interface representing the structure of country filters.
 */
interface CountryFilters {
  name: { common: string; official: string };
  flags: { png?: string; svg?: string };
  cca2: string;
  region: string;
  languages: Language;
  latlng: [Float, Float];
  postalCode: { format: string; regex: string };
  independent: boolean;
  phone_code: string;
}
export type countryResult = CountryFilters;
/**
 * Fetches a list of countries based on the provided filter parameters.
 * 
 * @param {Partial<CountryFilters>} [filterParams] - Optional filter parameters to narrow down the list of countries.
 * @returns {Promise<CountryFilters[]>} A promise that resolves to an array of country filters.
 */
const  fetchFilteredCountries = async (filterParams?: Partial<CountryFilters>): Promise<CountryFilters[]> => {
  try {
    const queryParams = new URLSearchParams(filterParams as Record<string, string>).toString();
    const url = `${COUNTRIES_API}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: CountryFilters[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
}

type simpleCountries = {
  name: { common: string; official: string };
  flags: { png?: string; svg?: string };
}

/**
 * Fetches a list of countries from the API.
 * 
 * @returns {Promise<CountryFilters[]>} A promise that resolves to an array of country filters.
 */

const fetchCountries = async (): Promise<CountryFilters[]> => {
  const res = await fetch(COUNTRIES_API);
  if (!res.ok) throw new Error("Failed to fetch countries");
  
  return await res.json() as Array<CountryFilters>;
}

export { fetchCountries, fetchFilteredCountries, simpleCountries, CountryFilters };