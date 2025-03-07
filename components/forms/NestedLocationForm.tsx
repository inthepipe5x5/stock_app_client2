//TODO: fix the typing here later
import React from "react";
import { useForm, Controller, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { VStack } from "@/components/ui/vstack";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { FormControl } from "@/components/ui/form-control";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectBackdrop,
  SelectFlatList,
  SelectItem,
} from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Image } from "@/components/ui/image";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { fetchCountries } from "@/utils/countries";
import { userCreateSchema } from "@/lib/schemas/userSchemas";
import { baseInputProps, GenericTextInput } from "@/components/forms/GenericTextInput";
import { HStack } from "@/components/ui/hstack";
import { locationSchema } from "@/lib/schemas/userSchemas";

export const NestedLocationForm = ({ ...props }) => {
  const { control, formState: { isValid, errors }, handleFocus, ...formContext } = useFormContext();

  // TanStack Query for countries
  const {
    data: countries,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
  });

  const schema = props?.zodSchema ?? props?.schema ?? locationSchema ?? userCreateSchema.partial();

  const controllerRules = props.controllerRules ?? {
    validate: async (value) => {
      try {
        await schema.parseAsync({ country: value });
        return true;
      } catch (error: any) {
        return error.message;
      }
    }, required: "Country is required",
  };

  return (
    <VStack space="md" flex={1}>
      <HStack space="md" className="w-full justify-evenly">
        {/* City Field */}
        <View className="min-w-[200px] max-w-3">
          <GenericTextInput {...baseInputProps({ inputName: "city", placeholder: "Enter City", returnKeyType: "next" })} />
        </View>

        {/* State/Region Field */}
        <View className="min-w-[200px] max-w-3">
          <GenericTextInput {...baseInputProps({ inputName: "state", placeholder: "Enter State/Region", returnKeyType: "next" })} />
        </View>
      </HStack>
      {/* Zip Code Field */}
      <View className="min-w-[200px] max-w-3">
        <GenericTextInput {...baseInputProps({ inputName: "postalcode", placeholder: "Enter Postal Code", returnKeyType: "next" })} />
      </View>

      {/* Country Field */}
      <FormControl className="w-full" isInvalid={!!errors.country}>
        <FormControlLabel className="text-sm mb-2">
          <FormControlLabelText>Country</FormControlLabelText>
        </FormControlLabel>
        <Controller
          name="country"
          control={control}
          rules={controllerRules}
          render={({ field: { onChange, onBlur, value } }) => (
            <Select
              onValueChange={onChange}
              selectedValue={value}
              defaultValue={props?.defaultValues?.country ?? "CA"}
              initialLabel="Canada"
              isHovered={true}
              onFocused={handleFocus}
            >
              <SelectTrigger variant="outline" size="md">
                <SelectInput placeholder="Select Country" />
                <SelectIcon className="mr-3" as={ChevronDownIcon} />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {countriesData?.map((country) => (
                    <HStack>
                      {country.flags.png && (
                        <Image
                          alt={"country flag"}
                          size="2xs"
                          source={{ uri: country.flags.png }}
                        />
                      )}{" "}
                      <SelectItem
                        label={country.name.official || country.name.common}
                        value={country.cca2}
                      />
                    </HStack>
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          )}
        />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} size="md" />
          <FormControlErrorText>
            {errors?.country?.message}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
    </VStack>
  );
}