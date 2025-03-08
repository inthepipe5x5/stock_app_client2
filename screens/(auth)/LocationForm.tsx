//TODO: fix the typing here later
import React, { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonGroup } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorIcon, FormControlErrorText } from "@/components/ui/form-control";
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
import { countryResult, fetchCountries } from "@/utils/countries";
// import { userCreateSchema } from "@/lib/schemas/userSchemas";
// import { baseInputProps, GenericTextInput } from "@/components/forms/GenericTextInput";
import { HStack } from "@/components/ui/hstack";
import { locationSchema } from "@/lib/schemas/userSchemas";
import { Heading } from "@/components/ui/heading";
import { MapPinHouse, SearchIcon } from "lucide-react-native";
// Zod validation schema


type LocationFormType = z.infer<typeof locationSchema>;

export const renderCountryItem = ({ ...country }: countryResult) => {
  const flagUri = country.flags.svg || country.flags.png;
  return (
    <HStack key={country.name.common}>
      <Avatar size="xs">
        <Image
          source={{ uri: flagUri }}
          alt={country.name.common}
          className="object-cover w-4 h-4"
        />
      </Avatar>
      <SelectItem
        label={country.name.common}
        value={country.name.common}
      />
    </HStack>
  );

};
// export const renderCountryItem = (countries: countryResult[]) => {
// return countries.map((country: countryResult, index: number) => {
//   const flagUri = country.flags.svg || country.flags.png;
//   return (
//     <HStack key={index}>
//       <Avatar size="xs">
//         <Image
//           source={{ uri: flagUri }}
//           alt={country.name.common}
//           className="object-cover w-4 h-4"
//         />
//       </Avatar>
//       <SelectItem
//         label={country.name.common}
//         value={country.name.common}
//       />
//     </HStack>
//   );
// });
// };



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
  const [disableForm, setDisableForm] = useState(formProps.disableForms ?? false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFocus = (name: string) => {
    inputRefs.current[name]?.scrollIntoView({ behavior: "smooth" });
    inputRefs.current[name]?.focus();
  };

  // React Hook Form setup
  const {
    reset,
    trigger,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationFormType>({
    resolver: zodResolver(locationSchema),
    defaultValues: defaultValues,
    reValidateMode: "onBlur",
  });

  // TanStack Query for countries
  const {
    data: countries,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
  });

  const onSubmit = /*formProps.onSubmit ?? */(formData: LocationFormType) => {
    // Dispatch to user session context under "user" key
    // Adjust the action type and payload structure to match your reducer


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

      // Navigate to sign-in screen after successful submission
      router.replace(formProps?.nextUrl ?? "/(auth)/signin");
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



  if (error) {
    return (
      <VStack className="justify-items-center align-center">
        <Text className="text-center text-error-500">
          Error loading countries: {String(error)}
        </Text>
      </VStack>
    );
  }

  const filteredCountries = countries?.filter((country: countryResult) =>
    country.name.common.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {
        // Only render the country field if countries have been fetched
        countries && !isLoading ? (
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
            render={({ field: { onChange, value } }) => (
              <Select
                selectedValue={value}
                onValueChange={(val) => onChange(val)}
                placeholder="Select or Type a Country"
                isRequired={true}
              >
                {countries && !isLoading ? (
                  <SelectTrigger
                    disabled={disableForm || isLoading}
                    variant="rounded"
                    size="lg"
                  >
                    <InputField
                      placeholder="Select or Type a Country 🌎"
                      defaultValue={defaultValues.country ?? ""}
                      value={value}
                      onChangeText={(text) => {
                        onChange(text);
                        setSearchQuery(text);
                      }}
                    />
                    <SelectIcon as={SearchIcon} size="sm" className="mr-safe-or-3" />): (

                  </SelectTrigger>
                ) : (
                  <SelectTrigger
                    disabled={disableForm || isLoading}
                    variant="rounded"
                    size="lg"
                  >
                    <HStack className="justify-between">
                      <InputField
                        placeholder="Loading Countries..."
                        value={value}
                      // onChangeText={(text) => {
                      //   onChange(text);
                      //   setSearchQuery(text);
                      // }}
                      />
                      <Spinner size="small" className="ml-5" />
                    </HStack>
                  </SelectTrigger>
                )}

                <SelectPortal>
                  <SelectBackdrop />
                  <SelectDragIndicator />
                  <SelectContent>
                    <SelectVirtualizedList
                      data={filteredCountries}
                      initialNumToRender={10}
                      keyExtractor={(item) => (item as countryResult).name.common}
                      getItem={(countryName: string) => filteredCountries?.find((country) => country.name.common === countryName)}
                      renderItem={({ item }) => renderCountryItem(item as countryResult)}
                    />
                  </SelectContent>
                </SelectPortal>
              </Select>
            )}
          />) : null}
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
          disabled={disableForm}
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
          render={({ field: { onChange, value } }) => (
            <Input>
              <InputField
                value={value}
                onChangeText={onChange}
                placeholder="Enter your city"
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
          disabled={disableForm}
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
          render={({ field: { onChange, value } }) => (
            <Input>
              <InputField
                value={value}
                onChangeText={onChange}
                placeholder="Enter your PostalCode"
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
        <Button onPress={() => {
          disableForm(true);
          handleSubmit(onSubmit);
        }} variant="solid" action="primary">
          Submit
        </Button>
        {/* Reset Button */}
        <Button variant="outline" action="negative" onPress={() => {
          reset();
          setDisableForm(false);
        }}>
          Reset Form
        </Button>
      </ButtonGroup>
    </VStack>
  );
};
