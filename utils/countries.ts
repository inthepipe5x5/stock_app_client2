import { Float } from "react-native/Libraries/Types/CodegenTypes";
/**
 * type representing the structure of country filters.
 */
type CountryFilters = {
  name: {
    common: string;
    official: string;
    nativeName: {
      [key: string]: {
        official: string;
        common: string;
      };
    };
  };
  tld: string[];
  cca2: string;
  ccn3: string;
  cca3: string;
  cioc: string;
  independent: boolean;
  status: string;
  unMember: boolean;
  currencies: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
  idd: {
    root: string;
    suffixes: string[];
  };
  capital: string[];
  altSpellings: string[];
  region: string;
  subregion: string;
  languages: Language;
  translations: {
    [key: string]: {
      official: string;
      common: string;
    };
  };
  latlng: [Float, Float];
  landlocked: boolean;
  area: number;
  demonyms: {
    eng: { f: string; m: string };
    fra: { f: string; m: string };
  };
  flag: string;
  maps: {
    googleMaps: string;
    openStreetMaps: string;
  };
  population: number;
  gini: {
    [key: string]: number;
  };
  fifa: string;
  car: {
    signs: string[];
    side: string;
  };
  timezones: string[];
  continents: string[];
  flags: {
    png: string;
    svg: string;
    alt: string;
  };
  coatOfArms: {
    png: string;
    svg: string;
  };
  startOfWeek: string;
  capitalInfo: {
    latlng: [Float, Float];
  };
}
export type countryResult = CountryFilters;
//lazy load local countries JSON data because restcountries API is down (Feb 2025)
export enum SortType {
  ALPHABETICAL = 'alphabetical',
  POPULATION = 'population',
  TIMEZONES = 'timezones',
  REGION = 'region',
}

export interface SortParams {
  sortType: SortType;
  sortKey: [keyof CountryFilters];
  sortDirection?: 'asc' | 'desc';
}


interface FilterParams extends Partial<CountryFilters> {}


export const loadLocalCountriesData = async (
  {
    sort = { sortType: SortType.ALPHABETICAL, sortKey: ['name'], sortDirection: 'asc' },
    filters = { unMember: true, independent: true },
  }: { sort?: SortParams; filters?: FilterParams; } = {}
) => {
  try {
    const countriesData = await require("@/utils/rest_countries.json");
    let data = countriesData as CountryFilters[];
    
    if (filters && filters !== null) {
      // Filter data
      data = countriesData.filter((country: CountryFilters) => {
        for (const key in filters) {
          if ((country as any)[key] !== (filters as Record<string, any>)[key]) return false;
        }
        return country.unMember && country.independent && country.flag;
      });

    }
    if (sort && sort !== null && typeof data === 'object') {
      // Sort data
      const { sortKey, sortDirection = 'asc' } = sort;
      data.sort((a: CountryFilters, b: CountryFilters) => {
        const aValue = a[sortKey[0]];
        const bValue = b[sortKey[0]];
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    console.log("Data post-sort by:", data.length, "countries found.");
          return data ? data : [];
    
  } catch (error) {
    console.error('Error loading local countries data:', error);
    return null;
  }
};

const COUNTRIES_API = undefined //process.env.EXPO_COUNTRIES_API;

/**
 * Interface representing the structure of a language object.
 */
interface Language {
  [key: string]: string;
}


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
    let response = null;
    let data = null;
    if (COUNTRIES_API) {
    response = await fetch(url);
    
    if (!response.ok) {
      //attempt to load local data if API fails
      response = await loadLocalCountriesData()
      data = response === null ? [] : response.filter((country: CountryFilters) => {
        for (const key in filterParams) {
          if ((country as any)[key] !== (filterParams as Record<string, any>)[key]) return false;
        }
        return true;  
      });
      return data ?? [];
    }
      if (response.status >= 400 && response.status < 600) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // data: CountryFilters[] = await response.json();
  }
  

    return data = response ? response.json() : null;

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
  if (COUNTRIES_API) {
    const res = await fetch(COUNTRIES_API);
    if (!res.ok) throw new Error("Failed to fetch countries");
    
    return await res.json() as Array<CountryFilters>;
  }
  // Fallback to local data if no API is provided
  return (await loadLocalCountriesData()) ?? [];
}
/** Utility function to find a country by a specific key-value pair.
 *  @requires @param filter - an object with keys @array of object keys to match and searchValue to filter by.
 *  @requires @param countries - an array of country objects to search through.
 *  @optional @param asArray - a boolean to return an array of matches or a single object.
 *  @returns the first country @object that matches the filter or an array of matches.
 */
export const findCountryByKey = (
  countries: countryResult[],
  filter: { keys: (keyof CountryFilters)[]; searchValue: string | number | null | undefined } = { keys: [], searchValue: "" },
  asArray: boolean = false,
  limit: number | null|undefined=undefined
) => {
  // If no filter keys are provided, return the original data (with optional limit)
  if (!!!filter|| !!!filter.keys || !!!filter.searchValue) {
    console.log('No keys provided to search by. Returning original data: num of countries =', countries.length);
    return !!limit ? countries.slice(0, (+limit <= 1 ? +limit + 1 : +limit)) : countries;
  }
  const matchFn = (country: CountryFilters): boolean => {
    return filter.keys.every((key) => {
      const value = country[key];
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value).includes(JSON.stringify(filter.searchValue));
      }
      return value === filter.searchValue;
    });
  };

  if (!countries || countries === null) return asArray ? [] : null;
  return asArray ? countries.filter(matchFn) : countries.find(matchFn);
};

const createSearchObject = (searchValue: string, searchKeys: string[]) => {
  return searchKeys.reduce((acc, key) => {
      acc[key] = searchValue;
      return acc;
  }, {} as Record<string, string>);
}

export { fetchCountries, fetchFilteredCountries, simpleCountries, CountryFilters };