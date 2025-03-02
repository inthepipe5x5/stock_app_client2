import { useState, useRef, RefObject } from "react";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { AlertCircleIcon, ChevronDownIcon, Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { Pressable } from "@/components/ui/pressable";
import { AlertCircle } from "lucide-react-native";
import { Button, ButtonText } from "@/components/ui/button";
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
import { convertCamelToSnake } from "@/utils/caseConverter";
import { pick } from "@/utils/pick";
import supabase from "@/lib/supabase/supabase";
import { fetchCountries } from "@/utils/countries";
import { useQuery } from "@tanstack/react-query";
import React from "react";
//mobile edit form

const ProfileEditScreen = (
  user: Partial<userProfile>,
  dispatch: (action: { type: string; payload: any }) => void
) => {
  const firstNameRef = useRef(null);
  const inputRefs = useRef<{ [key: string]: any }>({}); // Stores refs for each
  const submitRef = useRef<any>(null);

  const handleFocus = (name: string) => {
    inputRefs.current[name]?.scrollIntoView({ behavior: "smooth" });
    inputRefs.current[name]?.focus();
  };

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm<userSchemaDetails>({
    resolver: zodResolver(userCreateSchema),
  });

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

    //   (acc: { [key: string]: any }, key: string) => {
    //     let newKey = convertCamelToSnake(key);
    //     if (newKey in user) {
    //       acc[newKey] = (_data as Partial<userSchemaDetails>)[newKey];
    //     }
    //     return acc;
    //   },
    //   {}
    // );

    // const updatedProfile = await upsertUserProfile(upsertData, user);
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
          General Information
        </Heading>
        {/** Form Section: User Details */}
        <VStack space="md">
          {/**Input field: Names */}
          <HStack space="md">
            {/*Input field: First Name */}
            <FormControl isInvalid={!!errors.firstName} ref={firstNameRef}>
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
            </FormControl>
            {/*Input field: LastName */}

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
            </FormControl>
          </HStack>

          {/**Input field: Gender */}
          {/* <FormControl isInvalid={!!errors.gender}>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>Gender</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="gender"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await userCreateSchema.parseAsync({ city: value });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, value } }) => (
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
                {errors?.gender?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl> */}

          {/**Input field: Phone Number */}
          <FormControl isInvalid={!!errors.phoneNumber}>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>Phone number</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="phoneNumber"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await userCreateSchema.parseAsync({ phoneNumber: value });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <HStack className="gap-1">
                  <Select className="w-[28%]">
                    <SelectTrigger variant="outline" size="md">
                      <SelectInput placeholder="1" />
                      <SelectIcon className="mr-1" as={ChevronDownIcon} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="+1" value="1" />
                        <SelectItem label="+93" value="93" />
                        <SelectItem label="+155" value="155" />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                  <Input className="flex-1">
                    <InputField
                      placeholder="123-456-758"
                      defaultValue={user?.phone_number ?? ""}
                      type="text"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="number-pad"
                      onBlur={onBlur}
                      onSubmitEditing={() =>
                        handleKeyPress("phoneNumber" as string)
                      }
                      returnKeyType="next"
                    />
                  </Input>
                </HStack>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircle} size="md" />
              <FormControlErrorText>
                {errors?.phoneNumber?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        </VStack>

        {/** Form Section: Address */}

        <Heading className="font-roboto" size="md">
          Address
        </Heading>
        <VStack space="md">
          <FormControl isInvalid={!!errors.city}>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>City</FormControlLabelText>
            </FormControlLabel>
            <Controller
              // ref={(ref: string) => (inputRefs.current["city"] = ref)}
              name="city"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await userCreateSchema.parseAsync({ city: value });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, value } }) => (
                <Select onValueChange={onChange} selectedValue={value}>
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
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircle} size="md" />
              <FormControlErrorText>
                {errors?.city?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/**Input field: State */}
          <FormControl isInvalid={!!errors.state}>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>State/Region</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="state"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await userCreateSchema.parseAsync({ state: value });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                // <Select onValueChange={onChange} selectedValue={value}>
                //   <SelectTrigger variant="outline" size="md">
                //     <SelectInput placeholder="Select" />
                //     <SelectIcon className="mr-3" as={ChevronDownIcon} />
                //   </SelectTrigger>
                //   <SelectPortal>
                //     <SelectBackdrop />
                //     <SelectContent>
                //       <SelectDragIndicatorWrapper>
                //         <SelectDragIndicator />
                //       </SelectDragIndicatorWrapper>
                //       <SelectItem label="Karnataka" value="Karnataka" />
                //       <SelectItem label="Haryana" value="Haryana" />
                //       <SelectItem label="Others" value="Others" />
                //     </SelectContent>
                //   </SelectPortal>
                // </Select>
                <Input>
                  <InputField
                    placeholder="Your State/Region"
                    type="text"
                    value={value}
                    defaultValue={user?.state ?? ""}
                    // onEndEditing={() => setFocusedInput("")}
                    onFocus={() => handleFocus("state")}
                    onChangeText={onChange}
                    onSubmitEditing={() => handleKeyPress("state")}
                    returnKeyType="next"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircle} size="md" />
              <FormControlErrorText>
                {errors?.state?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

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
                <Select onValueChange={onChange} selectedValue={value}>
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
                      <SelectItem label="India" value="India" />
                      <SelectItem label="Sri Lanka" value="Sri Lanka" />
                      <SelectItem label="Others" value="Others" />
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

          <FormControl isInvalid={!!errors.postalcode}>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>postalcode</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="postalcode"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await userCreateSchema.parseAsync({
                      postalcode: value,
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
                    placeholder="Enter 6 - digit zip code"
                    type="text"
                    value={value}
                    defaultValue={user?.postalcode ?? ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={() => handleKeyPress("postalcode")}
                    returnKeyType="done"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircle} size="md" />
              <FormControlErrorText>
                {errors?.postalcode?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        </VStack>
        {/**Form Submit button */}
        <Button
          ref={submitRef}
          onPress={() => {
            handleSubmit(onSubmit)();
          }}
          className="flex-1 p-2"
        >
          <ButtonText>Save Changes</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
};

export default ProfileEditScreen;
