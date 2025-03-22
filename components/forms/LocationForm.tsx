//TODO: fix the typing here later
import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText } from "@/components/ui/form-control";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectIcon,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectVirtualizedList,
} from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Image } from "@/components/ui/image";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { countryResult, loadLocalCountriesData, SortType } from "@/utils/countries";
// import { userCreateSchema } from "@/lib/schemas/userSchemas";
// import { baseInputProps, GenericTextInput } from "@/components/forms/GenericTextInput";
import { HStack } from "@/components/ui/hstack";
import { locationSchema } from "@/lib/schemas/userSchemas";
import { Heading } from "@/components/ui/heading";
import { MapPinHouse, SearchIcon } from "lucide-react-native";
import { Keyboard } from "react-native";
import LoadingOverlay from "../navigation/TransitionOverlayModal";
import CountryDropDown from "./SearchableCountryPicker";
// Zod validation schema


type LocationFormType = z.infer<typeof locationSchema>;

// export const renderCountryItem = (country: Partial<countryResult>) => {
//   if (!country || !country.name) {
//     return {};
//   }

//   const flagUri = country?.flag ?? country.flags?.svg ?? country.flags?.png;
//   return (
//     <HStack key={country?.name?.common ?? new Crypto().getRandomValues(new Uint32Array(1))[0]}>
//       <Avatar size="xs">
//         <Image
//           source={{ uri: flagUri }}
//           alt={country?.name?.common}
//           className="object-cover w-4 h-4"
//         />
//       </Avatar>
//       <SelectItem
//         label={country?.name?.common}
//         value={country?.name?.common}
//       />
//     </HStack>
//   );



// };

const fallBackCountry = { "name": "Canada", "dial_code": "+1", "code": "CA", "flag": "🇨🇦" }

export type LocationFormProps = {
  defaultValues: Partial<LocationFormType>;
  formProps: {
    disableForms?: boolean;
    nextUrl?: string;
    submitButtonText?: string;
  };
};

export const LocationFormComponent = ({
  defaultValues,
  formProps,
}: {
  defaultValues: Partial<LocationFormType>;
  formProps: any;
}) => {
  const { state, dispatch } = useUserSession();
  const inputRefs = useRef<{ [key: string]: any }>({}); // Stores refs for each
  const submitRef = useRef<any>(null);
  const [disableForm, setDisableForm] = useState(formProps?.disableForms ?? false);
  // const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null | undefined>(defaultValues.country ?? "");

  const handleFocus = (name: string) => {
    inputRefs.current[name]?.scrollIntoView({ behavior: "smooth" });
    inputRefs.current[name]?.focus();
  };


  // // React Hook Form setup
  const {
    reset,
    trigger,
    control,
    handleSubmit,
    setFocus,
    setValue,
    getValues,
    formState: { errors }, ...methods
  } = useForm<LocationFormType>({
    resolver: zodResolver(locationSchema),
    defaultValues: defaultValues,
    // reValidateMode: "onBlur",
  });


  //set value of hidden country field
  const handleCountryDropDownUpdate = (country: string) => {

    if (country.trim().toLowerCase() !== getValues('country').toLowerCase()) {
      setValue('country', country, {
        shouldValidate: false, //skip validation
        shouldDirty: true,
      });
    }
    console.log("Country selected:", country, "form country input state: ", getValues('country'));
    handleFocus("state");
  }
  //effect to sync dropdown state with form state 
  useEffect(() => {

    if (!!selectedCountry && selectedCountry !== getValues('country')) {
      setValue('country', selectedCountry, {
        shouldValidate: false, //skip validation
        shouldDirty: true,
      });
    }
  }, [selectedCountry]);

  // // TanStack Query for countries
  // const {
  //   data: countries,
  //   isLoading,
  //   error,
  // } = useQuery({
  //   queryKey: ["countries"],
  //   queryFn: async () => { const data = await loadLocalCountriesData({ sort: { sortType: "alphabetical" as SortType, sortKey: ["name"] }, filters: { independent: true, unMember: true } }); console.log("Countries data found:", typeof data); return data; },
  // });

  const onSubmit = /*formProps.onSubmit ?? */(formData: LocationFormType) => {
    // Dispatch to user session context under "user" key
    // Adjust the action type and payload structure to match your reducer

    // console.log("State pre-update:", state);
    console.log("Form Data on-submit:", formData);
    //lock form inputs and trigger validation
    disableForm(true);
    trigger()

    //handle success
    if (Object.keys(errors).length > 0) {
      dispatch({
        type: "UPDATE_USER",
        payload: {
          country: formData.country,
          state: formData.state,
          city: formData.city,
          postalcode: formData.postalcode.toLowerCase(),
        },
      });
      console.log("State post-update:", state);
      // Navigate to sign-in screen after successful submission
      router.replace(formProps?.nextUrl ?? "/(auth)/(signin)");
    } else if (errors) {
      //unlock form;
      setDisableForm(false);
      //handle errors
      console.log("errors found in form submission", errors);
      //focus on first input with validation error
      handleFocus(Object.keys(errors)[0]);
    }

    reset();
  };

  // if (error) {
  //   return (
  //     <VStack className="justify-items-center align-center">
  //       <Text className="text-center text-error-500">
  //         Error loading countries: {String(error)}
  //       </Text>
  //       <Button
  //         variant="solid"
  //         action="negative"
  //         onPress={() => router.canGoBack() ? router.back() : router.replace("/")}
  //       >
  //         <ButtonText>Go Back</ButtonText>
  //       </Button>
  //     </VStack >
  //   );
  // }
  // console.log("Countries:", countries ? (countries.length ?? 0) : 0, Array.isArray(countries) ? "Array of objects" : typeof countries === "object" ? "Object of arrays of objects" : typeof countries);
  // const filteredCountries = countries ? (Object.values(countries) as countryResult[])?.filter((country: countryResult) =>
  //   country.name.common.toLowerCase().includes(searchQuery.toLowerCase())
  // ) : [];

  return (
    <VStack space="md" className="w-full">
      <Heading size="lg" bold>
        Enter Your Location
      </Heading>
      <HStack space="sm">
        <MapPinHouse size="24" />
        <Text size="sm" className="text-gray-500">
          Please enter your location details below to personalize your experience.
        </Text>
      </HStack>

      {/* Country Field */}
      <FormControl isInvalid={!!errors.country}>
        <FormControlLabel>
          <FormControlLabelText>Country</FormControlLabelText>
        </FormControlLabel>

        {/* Country DropDown Field */}
        <CountryDropDown
          selected={selectedCountry as any}
          setSelected={setSelectedCountry as any}
          disabled={disableForm}
          isLoading={methods.getFieldState("country").isValidating ?? false}
        />
        <Controller
          control={control}
          name="country"
          defaultValue={defaultValues.country ?? ""}
          rules={{
            required: "Country is required",
            validate: async (value: any) => {
              try {
                await locationSchema.parseAsync({
                  country: value,
                });
                return true;
              } catch (error: any) {
                handleFocus("country");
                return error.message;
              }
            }
          }}
          render={({ field: { onChange, value } }) => {
            return (
              <Input className="hidden">
                <InputField
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter your country"
                  returnKeyType="next"
                  onSubmitEditing={() => handleFocus("state")} />
              </Input>
            );
          }}
        />
        <FormControlError>
          <FormControlErrorText>
            {errors.country?.message}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>

      {/* State Field */}
      <FormControl isInvalid={!!errors.state}>
        <FormControlLabel>
          <FormControlLabelText>State/Region</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          defaultValue={defaultValues.state ?? ""}
          disabled={disableForm}
          name="state"
          rules={{
            required: "State/Region is required",
            validate: async (value: any) => {
              try {
                await locationSchema.parseAsync({
                  state: value,
                });
                return true;
              } catch (error: any) {
                handleFocus("state");
                return error.message;
              }
            }
          }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input>
              <InputField
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Enter your state/region"
                returnKeyType="next"
                onSubmitEditing={() => handleFocus("city")}
              />
            </Input>
          )}
        />
        <FormControlError>
          <FormControlErrorText>{errors.state?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>

      {/* City Field */}
      <FormControl isInvalid={!!errors.city}>
        <FormControlLabel>
          <FormControlLabelText>City</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="city"
          defaultValue={defaultValues.city ?? ""}
          disabled={!!!selectedCountry || disableForm}
          rules={{
            // required: "City is required",
            validate: async (value: any) => {
              try {
                await locationSchema.parseAsync({
                  city: value,
                });
                return true;
              } catch (error: any) {
                handleFocus("city");
                return error.message;
              }
            }
          }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input>
              <InputField
                value={value}
                onChangeText={onChange}
                placeholder="Enter your city"
                returnKeyType="next"
                onBlur={onBlur}
                onSubmitEditing={() => handleFocus("postalcode")}
              />
            </Input>
          )}
        />
        <FormControlError>
          <FormControlErrorText>{errors.city?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>

      {/* Postal Code Field */}
      <FormControl isInvalid={!!errors.postalcode}>
        <FormControlLabel>
          <FormControlLabelText>Postal Code</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="postalcode"
          defaultValue={defaultValues.postalcode ?? ""}
          disabled={!!!selectedCountry || disableForm}
          rules={{
            // required: "City is required",
            validate: async (value: any) => {
              try {
                await locationSchema.parseAsync({
                  postalcode: value,
                });
                return true;
              } catch (error: any) {
                handleFocus("postalcode");
                return error.message;
              }
            }
          }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input>
              <InputField
                value={value}
                onChangeText={onChange}
                placeholder="Enter your PostalCode"
                returnKeyType="done"
                onBlur={async () => {
                  //trigger entire form validation on blur
                  await trigger()

                  onBlur(); //blur the input
                  //focus on next input with validation error
                  if (Object.keys(errors).length > 0) {
                    handleFocus(Object.keys(errors)[0]);
                  }
                  //dismiss keyboard and focus on submit button
                  Keyboard.dismiss();
                  submitRef.current.focus();
                  submitRef.current.scrollIntoView({ behavior: "smooth" });
                }}
                onSubmitEditing={() => {
                  //trigger entire form validation on blur
                  trigger()
                  onBlur(); //blur the input
                  //focus on next input with validation error
                  if (Object.keys(errors).length > 0) {
                    handleFocus(Object.keys(errors)[0]);
                  }
                  //dismiss keyboard and focus on submit button
                  Keyboard.dismiss();
                  submitRef.current.focus();
                  submitRef.current.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </Input>
          )}
        />
        <FormControlError>
          <FormControlErrorText>{errors.postalcode?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>

      {/* Form Button Group */}
      <ButtonGroup space="md" className="justify-evenly">
        {/* Submit Button */}
        <Button
          ref={submitRef.current}
          onPress={() => {
            disableForm(true);
            handleSubmit(onSubmit);
          }} variant="solid" action="primary">
          {(formProps.nextUrl ?? formProps.submitButtonText) ? "Next" : "Submit"}
        </Button>
        {/* Reset Button */}
        <Button variant="outline" action="negative" onPress={() => {
          reset();
          if (!!setDisableForm) setDisableForm(false);
        }}>
          Reset Form
        </Button>
      </ButtonGroup>
    </VStack>
  );
};
