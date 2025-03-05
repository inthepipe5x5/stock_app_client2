import React, { useState, useRef, RefObject } from "react";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { AlertCircleIcon, ChevronDownIcon, Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { Pressable } from "@/components/ui/pressable";
import { AlertCircle, CheckCircle2, CheckCircle2Icon, RefreshCcwIcon } from "lucide-react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
// import { Image } from "expo-image";
import { Image } from "@/components/ui/image";
import { Input, InputField } from "@/components/ui/input";
import { Avatar, AvatarBadge, AvatarImage } from "@/components/ui/avatar";
import { Center } from "@/components/ui/center";
import { Keyboard } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { CameraSparklesIcon } from "@/screens/(tabs)/profile/assets/icons/camera-sparkles";
import { EditPhotoIcon } from "@/screens/(tabs)/profile/assets/icons/edit-photo";
import { userCreateSchema, userSchemaDetails } from "@/lib/schemas/userSchemas";
import { fakeUserAvatar } from "@/lib/placeholder/avatar";
import { upsertUserProfile } from "@/lib/supabase/session";
import { userProfile } from "@/constants/defaultSession";
import { convertCamelToSnake, convertSnakeToCamel } from "@/utils/caseConverter";
import { pick } from "@/utils/pick";
import supabase from "@/lib/supabase/supabase";
import { fetchCountries } from "@/utils/countries";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import { create } from "react-test-renderer";
//mobile edit form

const inputSequence = ["firstName", "lastName", "phoneNumber", "city", "state", "country", "postalcode"];

const capitalizeSnakeCaseInputName = (str: string) => {
  return str.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}



export const createControlledInput = ({ inputName, refs, control, schema, errors, isDirty, isValid, handleFocus, handleKeyPress, defaultValue, returnKeyType, }: any) => {

  return (
    <FormControl isInvalid={!!errors[inputName]} ref={refs}>
      <FormControlLabel className="mb-2">
        <FormControlLabelText>
          {capitalizeSnakeCaseInputName(inputName)}
        </FormControlLabelText>
      </FormControlLabel>
      control={control}
      rules={{
        validate: async (value: string) => {
          try {
            await schema.partial.parseAsync({
              [inputName]: value,
            });
            return true;
          } catch (error: any) {
            return error.message;
          }
        },
      }}
      render={({ field: { onChange, value } }: { field: { onChange: (value: string) => void, value: string } }) => (
        <Input>
          <HStack space="sm">
            {isValid ?? <CheckCircle2Icon />}
            <InputField
              placeholder={inputName}
              defaultValue={defaultValue[inputName] ?? ""}
              type="text"
              value={value}
              onFocus={() => handleFocus(inputName)}
              onChangeText={onChange}
              onSubmitEditing={() => handleKeyPress(inputName)}
              returnKeyType={returnKeyType}
            />
          </HStack>
        </Input>
      )}
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} size="md" />
        <FormControlErrorText>
          {errors?.[inputName]?.message}
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
  );


};

const ProfileEditScreen = (
  user: Partial<userProfile>,
  dispatch: (action: { type: string; payload: any }) => void
) => {
  const [currentFormStep, setCurrentFormStep] = useState(0);
  const inputRefs = useRef<{ [key: string]: any }>({}); // Stores refs for each
  const submitRef = useRef<any>(null);

  const handleFocus = (name: string) => {
    inputRefs.current[name]?.scrollIntoView({ behavior: "smooth" });
    inputRefs.current[name]?.focus();
  };

  const {
    control,
    formState: { errors, isDirty, isValid },
    handleSubmit,
    reset,
    watch,
  } = useForm<userSchemaDetails>({
    resolver: zodResolver(userCreateSchema),
  });

  // Fetch countries data for select dropdown
  const {
    data: countriesData,
    error: fetchCountriesError,
    isLoading,
  } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    // cacheTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    staleTime: 1000 * 60 * 60 * 24, // Data is considered fresh for 24 hours
  });

  const handleKeyPress = (name: string) => {
    Keyboard.dismiss();
    const inputNames = Object.keys(watch());
    console.log("Moving to next input names:", inputNames);
    //focus on input field if errors are present
    if (!!(errors as any)[name]) {
      handleFocus(inputNames[inputNames.indexOf(name)]);
    }
    //focus next input field or submit button
    inputNames.indexOf(name) === inputNames.length - 1
      ? submitRef.current?.focus()
      : handleFocus(inputNames[inputNames.indexOf(name) + 1]);
  };

  const onSubmit = async (_data: userSchemaDetails) => {
    const mapping = Object.keys(_data).reduce(
      (acc: { [key: string]: any }, key: string) => {
        let newKey = convertCamelToSnake(key);
        if (newKey in user) {
          acc[key] = newKey;
        }
        return acc;
      },
      {}
    );

    const upsertData = {
      ...user,
      ...pick(_data, Object.values(mapping)),
      user_id: user.user_id,
      email: user.email,
    };
    const updatedProfile = await supabase.from("profiles").upsert(upsertData, {
      onConflict: "user_id",
      ignoreDuplicates: false,
    });
    console.log("Form submission API response:", updatedProfile);

    if (updatedProfile.error) {
      console.error(
        "error on profile edit submission:",
        updatedProfile.error,
        "resetting form"
      );
      reset();
    } else {
      console.log("Profile edit successful");
      dispatch({ type: "UPDATE_USER", payload: updatedProfile.data });
    }
  };

  const createInputProps = (inputName: string) => {
    return {
      inputName,
      refs: inputRefs.current[inputName],
      control,
      schema: userCreateSchema,
      errors,
      isDirty,
      isValid,
      handleFocus,
      handleKeyPress,
      defaultValue: (user as { [key: string]: any })[convertSnakeToCamel(inputName)] ?? "",
      returnKeyType: "next",
    };
  };

  return (
    <VStack className="md:hidden mb-5">
      <Box className="w-full h-[188px]">
        <Image
          source={{
            uri: fakeUserAvatar({
              name: "John Doe",
              size: 100,
              avatarBgColor: "transparent",
            }),
          }}
          height={100}
          width={100}
          alt="Banner Image"
        />
      </Box>
      <Pressable className="absolute bg-background-950 rounded-full items-center justify-center h-8 w-8 right-6 top-[172px]">
        <Icon as={CameraSparklesIcon} />
      </Pressable>
      <Center className="w-full absolute top-10">
        <Avatar size="2xl">
          <AvatarImage
            source={{
              uri: fakeUserAvatar({
                name: "John Doe",
                size: 100,
                avatarBgColor: "transparent",
              }),
            }}
          />
          <AvatarBadge className="justify-center items-center bg-background-950">
            <Icon as={EditPhotoIcon} />
          </AvatarBadge>
        </Avatar>
      </Center>
      <VStack space="lg" className="mx-4 mt-4">
        <Heading className="font-roboto" size="sm">
          User Profile Information
        </Heading>
        {/** Form Section: User Details */}
        <Animated.View
          entering={FadeInLeft.duration(500)}
          exiting={FadeInRight.duration(500)}
        >
          <VStack space="md">
            {/**Input field: Names */}
            <HStack space="md">
              {/*Input field: First Name */}
              {/* <FormControl isInvalid={!!errors.firstName} ref={inputRefs}>
              <FormControlLabel className="mb-2">
                <FormControlLabelText>First Name</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="firstName"
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await userCreateSchema.parseAsync({
                        firstName: value,
                      });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <Input>
                    <InputField
                      placeholder="First Name"
                      defaultValue={user?.first_name ?? ""}
                      type="text"
                      value={value}
                      // onEndEditing={() => setFocusedInput("")}
                      onFocus={() => handleFocus("firstName")}
                      onChangeText={onChange}
                      onSubmitEditing={() => handleKeyPress("firstName")}
                      returnKeyType="next"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} size="md" />
                <FormControlErrorText>
                  {errors?.firstName?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl> */}
              {createControlledInput(createInputProps("firstName"))}
              {/*Input field: LastName */}
              {/* 
            <FormControl isInvalid={!!errors.lastName}>
              <FormControlLabel className="mb-2">
                <FormControlLabelText>Last Name</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="lastName"
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await userCreateSchema.parseAsync({
                        lastName: value,
                      });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      placeholder="Last Name"
                      type="text"
                      value={value}
                      defaultValue={user?.last_name ?? ""}
                      onFocus={() => handleFocus("lastName")}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={(e) =>
                        handleKeyPress(e.nativeEvent.text ?? "lastName")
                      }
                      returnKeyType="next"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} size="md" />
                <FormControlErrorText>
                  {errors?.lastName?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl> */}
              {createControlledInput(createInputProps("lastName"))}
            </HStack>

            {/**Input field: Phone Number */}
            {createControlledInput(createInputProps("phoneNumber"))}

            {/** Form Section: Address */}

            <Heading className="font-roboto" size="md">
              Address
            </Heading>
            <VStack space="md">
              {/**Input field: City */}
              {createControlledInput(createInputProps("city"))}

              {/**Input field: State */}

              {createControlledInput(createInputProps("state"))}

              {/**Input field: Country */}
              <FormControl isInvalid={!!errors.country}>
                <FormControlLabel className="mb-2">
                  <FormControlLabelText>Country</FormControlLabelText>
                </FormControlLabel>
                <Controller
                  name="country"
                  control={control}
                  rules={{
                    validate: async (value) => {
                      try {
                        await userCreateSchema.parseAsync({ country: value });
                        return true;
                      } catch (error: any) {
                        return error.message;
                      }
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Select
                      onValueChange={onChange}
                      selectedValue={value}
                      defaultValue="CA"
                      initialLabel="Canada"
                      isHovered={true}
                    >
                      <SelectTrigger variant="outline" size="md">
                        <SelectInput placeholder="Select" />
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

              {/**Input field: Zip Code */}
              {createControlledInput(createInputProps("postalcode"))}
            </VStack>

        </Animated.View>
        {/**Form Submit button */}
        <Button
          action="primary"
          variant="solid"
          ref={submitRef}
          onPress={() => {
            handleSubmit(onSubmit)();
          }}
          className="flex-1 p-2 text-center"
        >
          <HStack>
            <ButtonText>Save Changes</ButtonText>
            <ButtonIcon as={CheckCircle2} />
          </HStack>
        </Button>
      </VStack>
    </VStack>
  );
};

export default ProfileEditScreen;
