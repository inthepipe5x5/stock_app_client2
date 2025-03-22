import React, { useState, useRef, useMemo, useEffect, ReactNode } from 'react';
import { Keyboard, View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, TextInput, ViewStyle, TextStyle, KeyboardAvoidingView, Platform, TouchableNativeFeedback } from 'react-native';
import { ArrowDownFromLineIcon, ArrowUpFromLine, CheckCircle2Icon, ChevronDownCircleIcon, ChevronUpCircleIcon, LockIcon, LucideIcon, PanelTopCloseIcon, PanelTopOpenIcon, Search, TextSearchIcon, XCircleIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
// import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input"
// import countriesJson from "@/utils/rest_countries.json";
import { SearchIcon } from "@/components/ui/icon"

import { CountryFilters, countryResult, fetchCountries, findCountryByKey, loadLocalCountriesData } from '@/utils/countries';
import { useLocalSearchParams, SplashScreen, useRouter } from 'expo-router';
import ConfirmClose from '@/components/navigation/ConfirmClose';
import { useQuery } from '@tanstack/react-query';
import { sortAlphabetically } from '@/utils/sort';
// import useDebounce from '@/hooks/useDebounce';
import { set } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Divider } from '@/components/ui/divider';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonGroup, ButtonIcon, ButtonText } from '@/components/ui/button';
// import countries from "@/utils/rest_countries.json";

//modified interface props
interface CountryCodeProps {
    /**
* Selected Country
*/
    selected: countryCodeObj | null | undefined,
    /**
   * Function to set the country
   */
    setSelected: React.Dispatch<React.SetStateAction<countryCodeObj | null | undefined>>,
    /**
   * State variable for storing the phone number
   */
    phone?: string,
    /**
   * Function to set the phone number state variable
   */
    setPhone?: React.Dispatch<React.SetStateAction<string>>,
    /**
     * Prop to disable the component input
     */
    disabled?: boolean | undefined | null,
    /**
     * prop to set the loading state of the component
     * @default false
     */
    isLoading?: boolean,
    /**
   * Style the Country Code Container 
   */
    countryCodeContainerStyles?: ViewStyle,
    /**
   * Style the text inside Country Code 
   */
    countryCodeTextStyles?: TextStyle,
    /**
   * Phone Text Input Styles
   */
    phoneStyles?: TextStyle,
    /**
    * URL for the search Icon
    */
    searchIcon?: string,
    /**
    * URL for the close Icon
    */
    closeIcon?: string,
    /**
    * Search Input Container Styles
    */
    searchStyles?: ViewStyle,
    /**
    * Search Input Text Styles
    */
    searchTextStyles?: TextStyle,
    /**
    /**
   * Search Dropdown Container Styles
   */
    dropdownStyles?: ViewStyle,
    /**
   * Search Dropdown Text Styles
   */
    dropdownTextStyles?: TextStyle

}

export type countryCodeObj = {
    name: string,
    dial_code: string,
    code: string,
    flag: string
}

export const countries = [{ "name": "Afghanistan", "dial_code": "+93", "code": "AF", "flag": "🇦🇫" }, { "name": "Aland Islands", "dial_code": "+358", "code": "AX", "flag": "🇦🇽" }, { "name": "Albania", "dial_code": "+355", "code": "AL", "flag": "🇦🇱" }, { "name": "Algeria", "dial_code": "+213", "code": "DZ", "flag": "🇩🇿" }, { "name": "AmericanSamoa", "dial_code": "+1684", "code": "AS", "flag": "🇦🇸" }, { "name": "Andorra", "dial_code": "+376", "code": "AD", "flag": "🇦🇩" }, { "name": "Angola", "dial_code": "+244", "code": "AO", "flag": "🇦🇴" }, { "name": "Anguilla", "dial_code": "+1264", "code": "AI", "flag": "🇦🇮" }, { "name": "Antarctica", "dial_code": "+672", "code": "AQ", "flag": "🇦🇶" }, { "name": "Antigua and Barbuda", "dial_code": "+1268", "code": "AG", "flag": "🇦🇬" }, { "name": "Argentina", "dial_code": "+54", "code": "AR", "flag": "🇦🇷" }, { "name": "Armenia", "dial_code": "+374", "code": "AM", "flag": "🇦🇲" }, { "name": "Aruba", "dial_code": "+297", "code": "AW", "flag": "🇦🇼" }, { "name": "Australia", "dial_code": "+61", "code": "AU", "flag": "🇦🇺" }, { "name": "Austria", "dial_code": "+43", "code": "AT", "flag": "🇦🇹" }, { "name": "Azerbaijan", "dial_code": "+994", "code": "AZ", "flag": "🇦🇿" }, { "name": "Bahamas", "dial_code": "+1242", "code": "BS", "flag": "🇧🇸" }, { "name": "Bahrain", "dial_code": "+973", "code": "BH", "flag": "🇧🇭" }, { "name": "Bangladesh", "dial_code": "+880", "code": "BD", "flag": "🇧🇩" }, { "name": "Barbados", "dial_code": "+1246", "code": "BB", "flag": "🇧🇧" }, { "name": "Belarus", "dial_code": "+375", "code": "BY", "flag": "🇧🇾" }, { "name": "Belgium", "dial_code": "+32", "code": "BE", "flag": "🇧🇪" }, { "name": "Belize", "dial_code": "+501", "code": "BZ", "flag": "🇧🇿" }, { "name": "Benin", "dial_code": "+229", "code": "BJ", "flag": "🇧🇯" }, { "name": "Bermuda", "dial_code": "+1441", "code": "BM", "flag": "🇧🇲" }, { "name": "Bhutan", "dial_code": "+975", "code": "BT", "flag": "🇧🇹" }, { "name": "Bolivia, Plurinational State of", "dial_code": "+591", "code": "BO", "flag": "🇧🇴" }, { "name": "Bosnia and Herzegovina", "dial_code": "+387", "code": "BA", "flag": "🇧🇦" }, { "name": "Botswana", "dial_code": "+267", "code": "BW", "flag": "🇧🇼" }, { "name": "Brazil", "dial_code": "+55", "code": "BR", "flag": "🇧🇷" }, { "name": "British Indian Ocean Territory", "dial_code": "+246", "code": "IO", "flag": "🇮🇴" }, { "name": "Brunei Darussalam", "dial_code": "+673", "code": "BN", "flag": "🇧🇳" }, { "name": "Bulgaria", "dial_code": "+359", "code": "BG", "flag": "🇧🇬" }, { "name": "Burkina Faso", "dial_code": "+226", "code": "BF", "flag": "🇧🇫" }, { "name": "Burundi", "dial_code": "+257", "code": "BI", "flag": "🇧🇮" }, { "name": "Cambodia", "dial_code": "+855", "code": "KH", "flag": "🇰🇭" }, { "name": "Cameroon", "dial_code": "+237", "code": "CM", "flag": "🇨🇲" }, { "name": "Canada", "dial_code": "+1", "code": "CA", "flag": "🇨🇦" }, { "name": "Cape Verde", "dial_code": "+238", "code": "CV", "flag": "🇨🇻" }, { "name": "Cayman Islands", "dial_code": "+ 345", "code": "KY", "flag": "🇰🇾" }, { "name": "Central African Republic", "dial_code": "+236", "code": "CF", "flag": "🇨🇫" }, { "name": "Chad", "dial_code": "+235", "code": "TD", "flag": "🇹🇩" }, { "name": "Chile", "dial_code": "+56", "code": "CL", "flag": "🇨🇱" }, { "name": "China", "dial_code": "+86", "code": "CN", "flag": "🇨🇳" }, { "name": "Christmas Island", "dial_code": "+61", "code": "CX", "flag": "🇨🇽" }, { "name": "Cocos (Keeling) Islands", "dial_code": "+61", "code": "CC", "flag": "🇨🇨" }, { "name": "Colombia", "dial_code": "+57", "code": "CO", "flag": "🇨🇴" }, { "name": "Comoros", "dial_code": "+269", "code": "KM", "flag": "🇰🇲" }, { "name": "Congo", "dial_code": "+242", "code": "CG", "flag": "🇨🇬" }, { "name": "Congo, The Democratic Republic of the Congo", "dial_code": "+243", "code": "CD", "flag": "🇨🇩" }, { "name": "Cook Islands", "dial_code": "+682", "code": "CK", "flag": "🇨🇰" }, { "name": "Costa Rica", "dial_code": "+506", "code": "CR", "flag": "🇨🇷" }, { "name": "Cote d'Ivoire", "dial_code": "+225", "code": "CI", "flag": "🇨🇮" }, { "name": "Croatia", "dial_code": "+385", "code": "HR", "flag": "🇭🇷" }, { "name": "Cuba", "dial_code": "+53", "code": "CU", "flag": "🇨🇺" }, { "name": "Cyprus", "dial_code": "+357", "code": "CY", "flag": "🇨🇾" }, { "name": "Czech Republic", "dial_code": "+420", "code": "CZ", "flag": "🇨🇿" }, { "name": "Denmark", "dial_code": "+45", "code": "DK", "flag": "🇩🇰" }, { "name": "Djibouti", "dial_code": "+253", "code": "DJ", "flag": "🇩🇯" }, { "name": "Dominica", "dial_code": "+1767", "code": "DM", "flag": "🇩🇲" }, { "name": "Dominican Republic", "dial_code": "+1849", "code": "DO", "flag": "🇩🇴" }, { "name": "Ecuador", "dial_code": "+593", "code": "EC", "flag": "🇪🇨" }, { "name": "Egypt", "dial_code": "+20", "code": "EG", "flag": "🇪🇬" }, { "name": "El Salvador", "dial_code": "+503", "code": "SV", "flag": "🇸🇻" }, { "name": "Equatorial Guinea", "dial_code": "+240", "code": "GQ", "flag": "🇬🇶" }, { "name": "Eritrea", "dial_code": "+291", "code": "ER", "flag": "🇪🇷" }, { "name": "Estonia", "dial_code": "+372", "code": "EE", "flag": "🇪🇪" }, { "name": "Ethiopia", "dial_code": "+251", "code": "ET", "flag": "🇪🇹" }, { "name": "Falkland Islands (Malvinas)", "dial_code": "+500", "code": "FK", "flag": "🇫🇰" }, { "name": "Faroe Islands", "dial_code": "+298", "code": "FO", "flag": "🇫🇴" }, { "name": "Fiji", "dial_code": "+679", "code": "FJ", "flag": "🇫🇯" }, { "name": "Finland", "dial_code": "+358", "code": "FI", "flag": "🇫🇮" }, { "name": "France", "dial_code": "+33", "code": "FR", "flag": "🇫🇷" }, { "name": "French Guiana", "dial_code": "+594", "code": "GF", "flag": "🇬🇫" }, { "name": "French Polynesia", "dial_code": "+689", "code": "PF", "flag": "🇵🇫" }, { "name": "Gabon", "dial_code": "+241", "code": "GA", "flag": "🇬🇦" }, { "name": "Gambia", "dial_code": "+220", "code": "GM", "flag": "🇬🇲" }, { "name": "Georgia", "dial_code": "+995", "code": "GE", "flag": "🇬🇪" }, { "name": "Germany", "dial_code": "+49", "code": "DE", "flag": "🇩🇪" }, { "name": "Ghana", "dial_code": "+233", "code": "GH", "flag": "🇬🇭" }, { "name": "Gibraltar", "dial_code": "+350", "code": "GI", "flag": "🇬🇮" }, { "name": "Greece", "dial_code": "+30", "code": "GR", "flag": "🇬🇷" }, { "name": "Greenland", "dial_code": "+299", "code": "GL", "flag": "🇬🇱" }, { "name": "Grenada", "dial_code": "+1473", "code": "GD", "flag": "🇬🇩" }, { "name": "Guadeloupe", "dial_code": "+590", "code": "GP", "flag": "🇬🇵" }, { "name": "Guam", "dial_code": "+1671", "code": "GU", "flag": "🇬🇺" }, { "name": "Guatemala", "dial_code": "+502", "code": "GT", "flag": "🇬🇹" }, { "name": "Guernsey", "dial_code": "+44", "code": "GG", "flag": "🇬🇬" }, { "name": "Guinea", "dial_code": "+224", "code": "GN", "flag": "🇬🇳" }, { "name": "Guinea-Bissau", "dial_code": "+245", "code": "GW", "flag": "🇬🇼" }, { "name": "Guyana", "dial_code": "+595", "code": "GY", "flag": "🇬🇾" }, { "name": "Haiti", "dial_code": "+509", "code": "HT", "flag": "🇭🇹" }, { "name": "Holy See (Vatican City State)", "dial_code": "+379", "code": "VA", "flag": "🇻🇦" }, { "name": "Honduras", "dial_code": "+504", "code": "HN", "flag": "🇭🇳" }, { "name": "Hong Kong", "dial_code": "+852", "code": "HK", "flag": "🇭🇰" }, { "name": "Hungary", "dial_code": "+36", "code": "HU", "flag": "🇭🇺" }, { "name": "Iceland", "dial_code": "+354", "code": "IS", "flag": "🇮🇸" }, { "name": "India", "dial_code": "+91", "code": "IN", "flag": "🇮🇳" }, { "name": "Indonesia", "dial_code": "+62", "code": "ID", "flag": "🇮🇩" }, { "name": "Iran, Islamic Republic of Persian Gulf", "dial_code": "+98", "code": "IR", "flag": "🇮🇷" }, { "name": "Iraq", "dial_code": "+964", "code": "IQ", "flag": "🇮🇶" }, { "name": "Ireland", "dial_code": "+353", "code": "IE", "flag": "🇮🇪" }, { "name": "Isle of Man", "dial_code": "+44", "code": "IM", "flag": "🇮🇲" }, { "name": "Israel", "dial_code": "+972", "code": "IL", "flag": "🇮🇱" }, { "name": "Italy", "dial_code": "+39", "code": "IT", "flag": "🇮🇹" }, { "name": "Jamaica", "dial_code": "+1876", "code": "JM", "flag": "🇯🇲" }, { "name": "Japan", "dial_code": "+81", "code": "JP", "flag": "🇯🇵" }, { "name": "Jersey", "dial_code": "+44", "code": "JE", "flag": "🇯🇪" }, { "name": "Jordan", "dial_code": "+962", "code": "JO", "flag": "🇯🇴" }, { "name": "Kazakhstan", "dial_code": "+77", "code": "KZ", "flag": "🇰🇿" }, { "name": "Kenya", "dial_code": "+254", "code": "KE", "flag": "🇰🇪" }, { "name": "Kiribati", "dial_code": "+686", "code": "KI", "flag": "🇰🇮" }, { "name": "Korea, Democratic People's Republic of Korea", "dial_code": "+850", "code": "KP", "flag": "🇰🇵" }, { "name": "Korea, Republic of South Korea", "dial_code": "+82", "code": "KR", "flag": "🇰🇷" }, { "name": "Kuwait", "dial_code": "+965", "code": "KW", "flag": "🇰🇼" }, { "name": "Kyrgyzstan", "dial_code": "+996", "code": "KG", "flag": "🇰🇬" }, { "name": "Laos", "dial_code": "+856", "code": "LA", "flag": "🇱🇦" }, { "name": "Latvia", "dial_code": "+371", "code": "LV", "flag": "🇱🇻" }, { "name": "Lebanon", "dial_code": "+961", "code": "LB", "flag": "🇱🇧" }, { "name": "Lesotho", "dial_code": "+266", "code": "LS", "flag": "🇱🇸" }, { "name": "Liberia", "dial_code": "+231", "code": "LR", "flag": "🇱🇷" }, { "name": "Libyan Arab Jamahiriya", "dial_code": "+218", "code": "LY", "flag": "🇱🇾" }, { "name": "Liechtenstein", "dial_code": "+423", "code": "LI", "flag": "🇱🇮" }, { "name": "Lithuania", "dial_code": "+370", "code": "LT", "flag": "🇱🇹" }, { "name": "Luxembourg", "dial_code": "+352", "code": "LU", "flag": "🇱🇺" }, { "name": "Macao", "dial_code": "+853", "code": "MO", "flag": "🇲🇴" }, { "name": "Macedonia", "dial_code": "+389", "code": "MK", "flag": "🇲🇰" }, { "name": "Madagascar", "dial_code": "+261", "code": "MG", "flag": "🇲🇬" }, { "name": "Malawi", "dial_code": "+265", "code": "MW", "flag": "🇲🇼" }, { "name": "Malaysia", "dial_code": "+60", "code": "MY", "flag": "🇲🇾" }, { "name": "Maldives", "dial_code": "+960", "code": "MV", "flag": "🇲🇻" }, { "name": "Mali", "dial_code": "+223", "code": "ML", "flag": "🇲🇱" }, { "name": "Malta", "dial_code": "+356", "code": "MT", "flag": "🇲🇹" }, { "name": "Marshall Islands", "dial_code": "+692", "code": "MH", "flag": "🇲🇭" }, { "name": "Martinique", "dial_code": "+596", "code": "MQ", "flag": "🇲🇶" }, { "name": "Mauritania", "dial_code": "+222", "code": "MR", "flag": "🇲🇷" }, { "name": "Mauritius", "dial_code": "+230", "code": "MU", "flag": "🇲🇺" }, { "name": "Mayotte", "dial_code": "+262", "code": "YT", "flag": "🇾🇹" }, { "name": "Mexico", "dial_code": "+52", "code": "MX", "flag": "🇲🇽" }, { "name": "Micronesia, Federated States of Micronesia", "dial_code": "+691", "code": "FM", "flag": "🇫🇲" }, { "name": "Moldova", "dial_code": "+373", "code": "MD", "flag": "🇲🇩" }, { "name": "Monaco", "dial_code": "+377", "code": "MC", "flag": "🇲🇨" }, { "name": "Mongolia", "dial_code": "+976", "code": "MN", "flag": "🇲🇳" }, { "name": "Montenegro", "dial_code": "+382", "code": "ME", "flag": "🇲🇪" }, { "name": "Montserrat", "dial_code": "+1664", "code": "MS", "flag": "🇲🇸" }, { "name": "Morocco", "dial_code": "+212", "code": "MA", "flag": "🇲🇦" }, { "name": "Mozambique", "dial_code": "+258", "code": "MZ", "flag": "🇲🇿" }, { "name": "Myanmar", "dial_code": "+95", "code": "MM", "flag": "🇲🇲" }, { "name": "Namibia", "dial_code": "+264", "code": "NA", "flag": "🇳🇦" }, { "name": "Nauru", "dial_code": "+674", "code": "NR", "flag": "🇳🇷" }, { "name": "Nepal", "dial_code": "+977", "code": "NP", "flag": "🇳🇵" }, { "name": "Netherlands", "dial_code": "+31", "code": "NL", "flag": "🇳🇱" }, { "name": "New Caledonia", "dial_code": "+687", "code": "NC", "flag": "🇳🇨" }, { "name": "New Zealand", "dial_code": "+64", "code": "NZ", "flag": "🇳🇿" }, { "name": "Nicaragua", "dial_code": "+505", "code": "NI", "flag": "🇳🇮" }, { "name": "Niger", "dial_code": "+227", "code": "NE", "flag": "🇳🇪" }, { "name": "Nigeria", "dial_code": "+234", "code": "NG", "flag": "🇳🇬" }, { "name": "Niue", "dial_code": "+683", "code": "NU", "flag": "🇳🇺" }, { "name": "Norfolk Island", "dial_code": "+672", "code": "NF", "flag": "🇳🇫" }, { "name": "Northern Mariana Islands", "dial_code": "+1670", "code": "MP", "flag": "🇲🇵" }, { "name": "Norway", "dial_code": "+47", "code": "NO", "flag": "🇳🇴" }, { "name": "Oman", "dial_code": "+968", "code": "OM", "flag": "🇴🇲" }, { "name": "Pakistan", "dial_code": "+92", "code": "PK", "flag": "🇵🇰" }, { "name": "Palau", "dial_code": "+680", "code": "PW", "flag": "🇵🇼" }, { "name": "Palestinian Territory, Occupied", "dial_code": "+970", "code": "PS", "flag": "🇵🇸" }, { "name": "Panama", "dial_code": "+507", "code": "PA", "flag": "🇵🇦" }, { "name": "Papua New Guinea", "dial_code": "+675", "code": "PG", "flag": "🇵🇬" }, { "name": "Paraguay", "dial_code": "+595", "code": "PY", "flag": "🇵🇾" }, { "name": "Peru", "dial_code": "+51", "code": "PE", "flag": "🇵🇪" }, { "name": "Philippines", "dial_code": "+63", "code": "PH", "flag": "🇵🇭" }, { "name": "Pitcairn", "dial_code": "+872", "code": "PN", "flag": "🇵🇳" }, { "name": "Poland", "dial_code": "+48", "code": "PL", "flag": "🇵🇱" }, { "name": "Portugal", "dial_code": "+351", "code": "PT", "flag": "🇵🇹" }, { "name": "Puerto Rico", "dial_code": "+1939", "code": "PR", "flag": "🇵🇷" }, { "name": "Qatar", "dial_code": "+974", "code": "QA", "flag": "🇶🇦" }, { "name": "Romania", "dial_code": "+40", "code": "RO", "flag": "🇷🇴" }, { "name": "Russia", "dial_code": "+7", "code": "RU", "flag": "🇷🇺" }, { "name": "Rwanda", "dial_code": "+250", "code": "RW", "flag": "🇷🇼" }, { "name": "Reunion", "dial_code": "+262", "code": "RE", "flag": "🇷🇪" }, { "name": "Saint Barthelemy", "dial_code": "+590", "code": "BL", "flag": "🇧🇱" }, { "name": "Saint Helena, Ascension and Tristan Da Cunha", "dial_code": "+290", "code": "SH", "flag": "🇸🇭" }, { "name": "Saint Kitts and Nevis", "dial_code": "+1869", "code": "KN", "flag": "🇰🇳" }, { "name": "Saint Lucia", "dial_code": "+1758", "code": "LC", "flag": "🇱🇨" }, { "name": "Saint Martin", "dial_code": "+590", "code": "MF", "flag": "🇲🇫" }, { "name": "Saint Pierre and Miquelon", "dial_code": "+508", "code": "PM", "flag": "🇵🇲" }, { "name": "Saint Vincent and the Grenadines", "dial_code": "+1784", "code": "VC", "flag": "🇻🇨" }, { "name": "Samoa", "dial_code": "+685", "code": "WS", "flag": "🇼🇸" }, { "name": "San Marino", "dial_code": "+378", "code": "SM", "flag": "🇸🇲" }, { "name": "Sao Tome and Principe", "dial_code": "+239", "code": "ST", "flag": "🇸🇹" }, { "name": "Saudi Arabia", "dial_code": "+966", "code": "SA", "flag": "🇸🇦" }, { "name": "Senegal", "dial_code": "+221", "code": "SN", "flag": "🇸🇳" }, { "name": "Serbia", "dial_code": "+381", "code": "RS", "flag": "🇷🇸" }, { "name": "Seychelles", "dial_code": "+248", "code": "SC", "flag": "🇸🇨" }, { "name": "Sierra Leone", "dial_code": "+232", "code": "SL", "flag": "🇸🇱" }, { "name": "Singapore", "dial_code": "+65", "code": "SG", "flag": "🇸🇬" }, { "name": "Slovakia", "dial_code": "+421", "code": "SK", "flag": "🇸🇰" }, { "name": "Slovenia", "dial_code": "+386", "code": "SI", "flag": "🇸🇮" }, { "name": "Solomon Islands", "dial_code": "+677", "code": "SB", "flag": "🇸🇧" }, { "name": "Somalia", "dial_code": "+252", "code": "SO", "flag": "🇸🇴" }, { "name": "South Africa", "dial_code": "+27", "code": "ZA", "flag": "🇿🇦" }, { "name": "South Sudan", "dial_code": "+211", "code": "SS", "flag": "🇸🇸" }, { "name": "South Georgia and the South Sandwich Islands", "dial_code": "+500", "code": "GS", "flag": "🇬🇸" }, { "name": "Spain", "dial_code": "+34", "code": "ES", "flag": "🇪🇸" }, { "name": "Sri Lanka", "dial_code": "+94", "code": "LK", "flag": "🇱🇰" }, { "name": "Sudan", "dial_code": "+249", "code": "SD", "flag": "🇸🇩" }, { "name": "Suriname", "dial_code": "+597", "code": "SR", "flag": "🇸🇷" }, { "name": "Svalbard and Jan Mayen", "dial_code": "+47", "code": "SJ", "flag": "🇸🇯" }, { "name": "Swaziland", "dial_code": "+268", "code": "SZ", "flag": "🇸🇿" }, { "name": "Sweden", "dial_code": "+46", "code": "SE", "flag": "🇸🇪" }, { "name": "Switzerland", "dial_code": "+41", "code": "CH", "flag": "🇨🇭" }, { "name": "Syrian Arab Republic", "dial_code": "+963", "code": "SY", "flag": "🇸🇾" }, { "name": "Taiwan", "dial_code": "+886", "code": "TW", "flag": "🇹🇼" }, { "name": "Tajikistan", "dial_code": "+992", "code": "TJ", "flag": "🇹🇯" }, { "name": "Tanzania, United Republic of Tanzania", "dial_code": "+255", "code": "TZ", "flag": "🇹🇿" }, { "name": "Thailand", "dial_code": "+66", "code": "TH", "flag": "🇹🇭" }, { "name": "Timor-Leste", "dial_code": "+670", "code": "TL", "flag": "🇹🇱" }, { "name": "Togo", "dial_code": "+228", "code": "TG", "flag": "🇹🇬" }, { "name": "Tokelau", "dial_code": "+690", "code": "TK", "flag": "🇹🇰" }, { "name": "Tonga", "dial_code": "+676", "code": "TO", "flag": "🇹🇴" }, { "name": "Trinidad and Tobago", "dial_code": "+1868", "code": "TT", "flag": "🇹🇹" }, { "name": "Tunisia", "dial_code": "+216", "code": "TN", "flag": "🇹🇳" }, { "name": "Turkey", "dial_code": "+90", "code": "TR", "flag": "🇹🇷" }, { "name": "Turkmenistan", "dial_code": "+993", "code": "TM", "flag": "🇹🇲" }, { "name": "Turks and Caicos Islands", "dial_code": "+1649", "code": "TC", "flag": "🇹🇨" }, { "name": "Tuvalu", "dial_code": "+688", "code": "TV", "flag": "🇹🇻" }, { "name": "Uganda", "dial_code": "+256", "code": "UG", "flag": "🇺🇬" }, { "name": "Ukraine", "dial_code": "+380", "code": "UA", "flag": "🇺🇦" }, { "name": "United Arab Emirates", "dial_code": "+971", "code": "AE", "flag": "🇦🇪" }, { "name": "United Kingdom", "dial_code": "+44", "code": "GB", "flag": "🇬🇧" }, { "name": "United States", "dial_code": "+1 ", "code": "US", "flag": "🇺🇸" }, { "name": "Uruguay", "dial_code": "+598", "code": "UY", "flag": "🇺🇾" }, { "name": "Uzbekistan", "dial_code": "+998", "code": "UZ", "flag": "🇺🇿" }, { "name": "Vanuatu", "dial_code": "+678", "code": "VU", "flag": "🇻🇺" }, { "name": "Venezuela, Bolivarian Republic of Venezuela", "dial_code": "+58", "code": "VE", "flag": "🇻🇪" }, { "name": "Vietnam", "dial_code": "+84", "code": "VN", "flag": "🇻🇳" }, { "name": "Virgin Islands, British", "dial_code": "+1284", "code": "VG", "flag": "🇻🇬" }, { "name": "Virgin Islands, U.S.", "dial_code": "+1340", "code": "VI", "flag": "🇻🇮" }, { "name": "Wallis and Futuna", "dial_code": "+681", "code": "WF", "flag": "🇼🇫" }, { "name": "Yemen", "dial_code": "+967", "code": "YE", "flag": "🇾🇪" }, { "name": "Zambia", "dial_code": "+260", "code": "ZM", "flag": "🇿🇲" }, { "name": "Zimbabwe", "dial_code": "+263", "code": "ZW", "flag": "🇿🇼" }]
// const defaultCountry = countries.findIndex((item) => { return item.name.toLowerCase() === "canada" });
// const defaultIndex = defaultCountry > 0 ? defaultCountry : 0;

const CountryDropDown: React.FC<CountryCodeProps> = ({
    selected, //= countries[defaultCountry],
    setSelected,
    phone,
    setPhone,
    disabled,
    isLoading = false,
    phoneStyles = {},
    countryCodeContainerStyles = {},
    countryCodeTextStyles = {},
    searchIcon = TextSearchIcon,
    closeIcon = PanelTopCloseIcon,
    searchStyles = {},
    searchTextStyles = {},
    dropdownStyles = {},
    dropdownTextStyles = {},

}) => {

    const [dropdownOpen, setDropDownOpen] = React.useState(false);
    const [_search, _setSearch] = React.useState('');
    const [_countries, _setCountries] = React.useState(countries);
    const [resultsCount, setResultsCount] = React.useState<number>(countries.length);
    const [loading, setLoading] = React.useState<boolean>(!!isLoading);
    const [initialScrollIndex, setInitialScrollIndex] = React.useState<number>(0);
    const searchInputRef = React.useRef<TextInput>(null);

    const slideAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        //open the dropdown dynamically
        return !!!dropdownOpen ?
            slideUp() :
            slideDown();
    }, [dropdownOpen]);

    //effect to set the initialScrollIndex
    React.useEffect(() => {
        if (!!!selected || selected === undefined) setInitialScrollIndex(0);

        const selectedCodeIndex = countries.findIndex((item) => { return item.name === selected?.name });
        //guard clause
        if (initialScrollIndex === selectedCodeIndex) return;

        console.log({
            selectedCodeIndex,
            initialScrollIndex,
        });
        setInitialScrollIndex(selectedCodeIndex > 0 ? selectedCodeIndex : 0);
    }, [selected, loading]);

    const slideDown = () => {
        setDropDownOpen(true);
        Animated.timing(slideAnim, {
            toValue: 235,
            duration: 300,
            useNativeDriver: false
        }).start();
    };

    const slideUp = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false
        }).start(() => setDropDownOpen(false));
    };

    const handleTextSearch = (text: string) => {
        //parse the text 
        //set the search text
        if (text !== _search) {
            //set loading to true
            setLoading(true);
            phone != undefined && setPhone != undefined ? setPhone(text) : _setSearch(text);
            let c = countries.filter((item) => { return item.name.includes(text) || item.dial_code.includes(text) || item.code.includes(text) })
            _setCountries(sortAlphabetically(c, Number.isNaN(text) ? 'name' : 'dial_code'));
            setResultsCount(c.length);
            //set loading to false
            return setLoading(false)
        }
        //do nothing if the text is the same
        if (loading) setLoading(false); //set loading to false if it is still loading
        return
    }

    const TextSearchInput = (phoneInput: boolean = false) => {
        return (
            // <View style={[styles.selectedContainer, countryCodeContainerStyles]}>
            <TextInput
                onChangeText={handleTextSearch}
                // initialValue={(!!selected ? selected.name : _search)}
                style={[styles.searchInput, phoneInput ? phoneStyles : searchTextStyles]}
                value={_search}
                placeholder={!!selected ? 'Choose another country?' : 'Search name or dial code'}
                placeholderTextColor={!!!selected ? 'black' : '#dddddd'}
                keyboardType={!!!phoneInput ? 'default' : 'phone-pad'}
                autoCapitalize={!!!phoneInput ? 'words' : 'none'}
                onFocus={() => {
                    if (!dropdownOpen) setDropDownOpen(true);

                    return;
                }}
                ref={searchInputRef}
            />
            // </View>
        );
    }
    const handleCountryPress = (item: countryCodeObj) => {

        //set the selected country if it is not the same as the current selected country
        if (!!!selected || !!selected && item.code !== selected.code) {
            // setSelected(item);
            // setInitialScrollIndex(_countries.findIndex((i) => i.name === item.name));
            // _setSearch(item.name);
            handleSave(item)
        }
        // slideUp();
        if (loading) setLoading(false);
        if (phone && setPhone) setPhone(item.dial_code);
        setDropDownOpen(false);
        return;
    }

    const handleToggleDropdown = (e: any) => {
        e.preventDefault();
        //set the countries to _search text state if it is not set and the dropdown is going to be opened
        if (!_countries && !dropdownOpen === true) handleTextSearch(_search);
        setDropDownOpen(!dropdownOpen);
    }

    const ToggleDropDownButton = () => {
        const toggleIcon = dropdownOpen ? PanelTopCloseIcon : PanelTopOpenIcon;

        return (
            <View style={[styles.row, { justifyContent: "space-between", maxWidth: '100%', paddingHorizontal: 10 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>

                    {!!!selected ? (
                        <Button
                            onPress={handleToggleDropdown}
                            action={selected ? 'secondary' : 'primary'}
                            className="ml-0 mr-1"
                            variant={!!!dropdownOpen ? "solid" : "outline"}
                        // style={{ marginHorizontal: 10 }}
                        >
                            {<ButtonIcon as={toggleIcon} className="ml-[1px" size={'lg'} color={!!!dropdownOpen ? "white" : "black"} />}
                            {/* {dropdownOpen ? <PanelTopCloseIcon size={32} /> : <PanelTopOpenIcon size={32} />} */}
                        </Button>
                    ) :
                        ClearSelectionButton()}
                </View>
                <TouchableOpacity style={{ flexDirection: 'row' }}
                    // onPress={() => { _setCountries(countries); slideDown() }}>
                    onPress={handleToggleDropdown}
                >
                    {/**dropDown is closed 
                             *  @default 
                             */}
                    <View style={[styles.inputBoxContainer, countryCodeContainerStyles]}>
                        {//render the text search input based on the input type
                            TextSearchInput(Boolean(phone != undefined && setPhone != undefined))
                        }
                    </View>

                </TouchableOpacity>
                {/* <Divider className="h-full self-center mx-2" orientation='vertical' /> */}
            </View >
        )

    }


    //save the selected country and close the dropdown
    const handleSave = (item: any) => {
        setSelected(item);
        setInitialScrollIndex(_countries.findIndex((i) => i.name === item.name));
        _setSearch(item.name);
        slideUp();
    }

    // const resetSelection = () => {
    //     setLoading(true);
    //     if (phone && setPhone) { setPhone(""); }
    //     setSelected(undefined);
    //     setInitialScrollIndex(0);
    //     _setCountries(countries);
    //     _setSearch("");
    //     setResultsCount(countries.length);
    //     //reset the selected country in the parent component
    //     setSelected(undefined);
    //     setLoading(false);
    //     //focus the search input
    //     Keyboard.addListener('keyboardDidHide', () => {
    //         searchInputRef.current?.focus();
    //         return Keyboard.removeAllListeners('keyboardDidHide');
    //     });

    //     slideDown();
    //     // slideUp();
    // }

    const resetSelection = () => {
        setLoading(true);

        if (phone && setPhone) {
            setPhone("");
        }

        _setSearch(""); // clear search field
        _setCountries(countries); // restore original list
        setResultsCount(countries.length);
        setSelected(undefined); // clear selected country
        setInitialScrollIndex(0);

        setLoading(false);
        slideUp(); // ✅ CLOSE the dropdown instead of slideDown
    };

    const ClearSelectionButton = () => {
        return (
            <Button
                onPress={() => {
                    console.log("Clearing selection");
                    resetSelection();
                    console.log("Selection cleared", { selected });
                    // slideUp();
                }}
                disabled={!!!selected}
                action='negative'
                className="text-white bg-red-400 align-middle"
                size="md"
                variant="solid"
            >
                {/* <HStack space="md" className="w-full justify-center items-center"> */}
                <ButtonIcon as={XCircleIcon} size="lg" className="resize outline-white-50" color='red' />
                {/* <ButtonText>Clear</ButtonText> */}
                {/* </HStack> */}
            </Button>
        )
    }
    const renderCountryItem = (item: countryCodeObj, current: boolean = false) => {
        return (
            <TouchableNativeFeedback
                onPress={(e: any) => { e.target._onPress(() => handleCountryPress(item)) }}
                background={TouchableNativeFeedback.Ripple('rgba(0,0,0,0.2)', true)}
                useForeground={true}
            >
                <TouchableOpacity style={styles.countryContainer} key={item.code} onPress={() => {
                    if (loading) return;
                    handleCountryPress(item)
                }}>
                    <View style={[
                        styles.row,
                    ]}
                        className={`flex-row flex-nowrap items-center`}
                    >
                        <Text style={styles.countryFlag}>{item?.flag}</Text>
                        <Text style={[
                            styles.countryText,
                            dropdownTextStyles,
                            { textOverflow: 'none', color: 'black' }
                        ]}>
                            {item?.name}
                        </Text>
                    </View>
                    <Text style={[styles.countryText, { marginLeft: 'auto' }]}>{item?.dial_code}</Text>
                </TouchableOpacity>
            </TouchableNativeFeedback>
        )
    }

    return (
        <View style={styles.container}>
            {/* <Text className={`my-10 text-lg ${!!selected.name ? "italic text-green-500" : "text-grey-500"}`} >
                {!!selected ? `Country Selected ${selected.flag}` : "Select a Country"}
            </Text> */}
            {/* {RenderBtn()} */}
            <View style={styles.row} className={`flex-row flex-nowrap items-center`}>

                <Text className="text-start text-sm text-gray-400">
                    {`Currently selected:  `}
                </Text>
                <Text style={[styles.countryText, { color: !!selected ? "green" : "grey" }]}>
                    {!!selected ? `${selected.flag}  ${selected.name}` : "None"}
                </Text>
            </View>

            {ToggleDropDownButton()}
            <TouchableOpacity
                disabled={loading}
                onPress={(e) => {
                    console.log("Save button pressed");
                    if (!!selected)
                        handleSave(selected);
                    handleToggleDropdown(e);
                    // setDropDownOpen(!dropdownOpen)
                }}>

                {selected ? (
                    <View
                        style={styles.row}
                        className={`text-typography-white bg-green-500 align-middle justify-center py-2 max-h-[235px] mt-2 min-w-full border-b-0 rounded-lg flex-row flex-nowrap items-center`}
                    >
                        <Text className="text-typography-white px-2 text-xl" style={[styles.countryText, dropdownTextStyles]}>Save </Text>
                        <CheckCircle2Icon className="text-typography-black px-2 text-md ml-auto" color="white" />
                    </View>
                ) :

                    (
                        <View
                            className="text-red-500 align-middle bg-grey-100 justify-center py-2 max-h-[235px] mt-2 min-w-full rounded-lg flex-row flex-nowrap items-center"
                        >
                            <Text className=" px-2 text-xl text-red-300" >{`${resultsCount > 0 ? "Please select country" : "Try searching something else."}`}</Text>
                            {dropdownOpen ? (<ArrowUpFromLine className="text-typography-grey px-2 text-md ml-auto" color={"grey"} />) : (<ArrowDownFromLineIcon className="text-typography-black px-2 text-md ml-auto" color="black" />)}
                        </View>
                    )
                }
            </TouchableOpacity>
            {
                (dropdownOpen)
                    ?
                    // <Animated.View
                    //     style={{ maxHeight: slideAnim }}
                    // >
                    <FlatList
                        style={[styles.resultsContainer, dropdownStyles]}
                        data={_countries}

                        showsVerticalScrollIndicator={true}
                        // ItemSeparatorComponent={() => <Divider className="w-full self-center" />}
                        renderItem={({ item, index }) => renderCountryItem(item, index === initialScrollIndex)
                        }
                        refreshing={loading}
                        onRefresh={() => {
                            setLoading(true);
                            resetSelection();
                            // setDropDownOpen(false);
                        }}
                        getItemLayout={(data, index) => (
                            { length: 50, offset: 50 * index, index }
                        )}
                        initialScrollIndex={initialScrollIndex}

                        // extraData={selected}
                        keyExtractor={(item) => item.code}
                        ListEmptyComponent={() => {
                            if (!!countries && countries.length === 0) {
                                return (<Text style={{ padding: 15, textAlign: 'center' }}>No Results Found</Text>)
                            }
                            return (<Spinner className="mx-safe-or-20" size="large" color={countries.length > 0 ? "grey" : "red"} />);
                        }
                        }
                        ListHeaderComponent={() => {
                            return (
                                <VStack space={"md"} className="w-[90%] mx-auto text-center align-middle p-safe-offset-1 pb-5">
                                    {loading ? //render the spinner if loading
                                        <Spinner className="mx-safe-or-20" size="large" color={countries.length > 0 ? "grey" : "red"} />
                                        : //render the results count
                                        (!!!resultsCount || resultsCount <= 0 ?
                                            (<Text className="text-center text-sm text-gray-400">No results found. Try searching something else.</Text>) :
                                            (
                                                <Text className="text-center text-sm text-gray-400">
                                                    {`${resultsCount} Results Found`}
                                                </Text>
                                            ))
                                    }
                                </VStack>
                            )
                        }}
                    />
                    // </Animated.View>
                    :
                    <></>
            }
            {/* <VStack space={"md"} className="w-[90%] mx-auto text-center align-middle p-safe-offset-1"> */}
            {/* <Animated.View
                    style={{
                        height: slideAnim.interpolate({
                            inputRange: [0, 235],
                            outputRange: [20, 255]
                        }),
                        // overflow: 'hidden',
                        marginTop: 8,
                        animationDelay: '0.5s',
                        animationDuration: '0.5s',
                        animationFillMode: 'both',
                        animationTimingFunction: 'ease-in-out',
                    }}
                >
                </Animated.View> */}


            {/* </VStack> */}
        </View >
    )
}

export default CountryDropDown;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    searchInput: {
        // borderWidth: 1,
        // borderColor: '#dddddd',
        borderRadius: 8,
        // paddingLeft: 10,
        marginLeft: 'auto', //align the text to the right
        // paddingLeft: 'auto',
        minWidth: '80%',
        maxWidth: '100%',
        flexGrow: 1,
        // marginRight: 'auto'
    },
    inputBoxContainer: {
        width: '95%',
        borderWidth: 1,
        borderColor: '#dddddd',
        borderRadius: 8,
        backgroundColor: 'white',
        flexDirection: 'row',
        // justifyContent: 'space',
        alignItems: 'center',
        height: 50,
    },
    container: {
        width: '95%',
        padding: 15,
        fontSize: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedContainer: {
        width: '95%',
        padding: 15,
        // marginLeft: 'auto',
        // marginRight: 'auto',
        flexDirection: 'row',
        minWidth: '80%',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#dddddd',
        borderRadius: 8,
        backgroundColor: 'white'
    },
    resultsContainer: {
        borderWidth: 1,
        borderColor: '#dddddd',
        borderRadius: 8,
        maxHeight: 255,
        backgroundColor: 'white',
        marginTop: 8,
        minWidth: '100%'
    },
    countryContainer: {
        flexDirection: 'row',
        // paddingHorizontal: 15,
        paddingRight: 30,
        paddingLeft: 15,
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderColor: '#dedede',
        alignItems: 'center'
    },
    countryFlag: {
        marginRight: 8,
        color: 'black'
    },
    countryText: {
        fontWeight: 'bold'
    },

    icon: {
        width: 10,
        height: 10
    }
});