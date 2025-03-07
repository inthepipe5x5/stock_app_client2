// @ts-nocheck
//TODO: fix the typing here later
import React from "react";
import { useForm, Controller } from "react-hook-form";
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
// Zod validation schema


type LocationFormType = z.infer<typeof locationSchema>;

export default function LocationFormScreen({
  defaultValues,
  formProps,
}: {
  defaultValues: Partial<LocationFormType>;
  formProps: any;
}) {
  const { state, dispatch } = useUserSession();
  const inputRefs = useRef<{ [key: string]: any }>({}); // Stores refs for each
  const submitRef = useRef<any>(null);

  const handleFocus = (name: string) => {
    inputRefs.current[name]?.scrollIntoView({ behavior: "smooth" });
    inputRefs.current[name]?.focus();
  };
  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationFormType>({
    resolver: zodResolver(locationSchema),
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

  const onSubmit = (formData: LocationFormType) => {
    // Dispatch to user session context under "user" key
    // Adjust the action type and payload structure to match your reducer
    dispatch({
      type: "UPDATE_USER",
      payload: {
        country: formData.country,
        state: formData.state,
        city: formData.city,
      },
    });

    // Navigate to sign-in screen after successful submission
    router.replace("/(auth)/signin" as any);
  };

  // Basic error or loading states for countries
  if (isLoading) {
    return (
      <VStack flexGrow={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
        <Text>Loading Countries...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack className="justify-items-center align-center">
        <Text className="text-center text-error-500">
          Error loading countries: {String(error)}
        </Text>
      </VStack>
    );
  }

  return (
    // AuthLayout will wrap this, so we only render the form portion
    <VStack space="md" className="w-full" flex={1}>
      <Text size="xl" fontWeight="bold">
        Enter Your Location
      </Text>

      {/* Country Field */}
      <FormControl isInvalid={!!errors.country}>
        <FormControl.Label>
          <FormControl.LabelText>Country</FormControl.LabelText>
        </FormControl.Label>
        <Controller
          control={control}
          name="country"
          render={({ field: { onChange, value } }) => (
            <Select
              selectedValue={value}
              onValueChange={(val) => onChange(val)}
              placeholder="Select or Type a Country"
            >
              {/* Provide user a typeable select or basic filter logic as needed */}
              {countries?.map((country, idx) => {
                const flagUri = country.flags.svg || country.flags.png;
                return (
                  <SelectItem
                    key={idx}
                    label={country.name.common}
                    value={country.name.common}
                    leftIcon={
                      flagUri ? (
                        <Avatar size="xs">
                          <Image
                            source={{ uri: flagUri }}
                            alt={country.name.common}
                            className="object-cover w-4 h-4"
                          />
                        </Avatar>
                      ) : undefined
                    }
                  />
                );
              })}
            </Select>
          )}
        />
        <FormControl.Error>
          <FormControl.ErrorText>
            {errors.country?.message}
          </FormControl.ErrorText>
        </FormControl.Error>
      </FormControl>

      {/* State Field */}
      <FormControl isInvalid={!!errors.state}>
        <FormControl.Label>
          <FormControl.LabelText>State/Region</FormControl.LabelText>
        </FormControl.Label>
        <Controller
          control={control}
          name="state"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChangeText={onChange}
              placeholder="Enter your state/region"
            />
          )}
        />
        <FormControl.Error>
          <FormControl.ErrorText>{errors.state?.message}</FormControl.ErrorText>
        </FormControl.Error>
      </FormControl>

      {/* City Field */}
      <FormControl isInvalid={!!errors.city}>
        <FormControl.Label>
          <FormControl.LabelText>City</FormControl.LabelText>
        </FormControl.Label>
        <Controller
          control={control}
          name="city"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChangeText={onChange}
              placeholder="Enter your city"
            />
          )}
        />
        <FormControl.Error>
          <FormControl.ErrorText>{errors.city?.message}</FormControl.ErrorText>
        </FormControl.Error>
      </FormControl>

      {/* Submit Button */}
      <Button onPress={handleSubmit(onSubmit)} variant="solid" action="primary">
        Submit
      </Button>
    </VStack>
  );
}
