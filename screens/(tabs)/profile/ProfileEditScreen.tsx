import { useState } from "react";
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
//mobile edit form
const ProfileEditScreen = () => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<userSchemaDetails>({
    resolver: zodResolver(userCreateSchema),
  });

  const handleKeyPress = () => {
    Keyboard.dismiss();
  };
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);

  const onSubmit = (_data: userSchemaDetails) => {
    reset();
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
        <VStack space="md">
          <FormControl isInvalid={!!errors.firstName || isNameFocused}>
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
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="First Name"
                    type="text"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
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
          <FormControl isInvalid={!!errors.lastName || isNameFocused}>
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
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
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
          <FormControl isInvalid={!!errors.gender}>
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
                      <SelectItem label="Male" value="male" />
                      <SelectItem label="Female" value="female" />
                      <SelectItem label="Others" value="others" />
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
          </FormControl>
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
                      <SelectInput placeholder="+91" />
                      <SelectIcon className="mr-1" as={ChevronDownIcon} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="93" value="93" />
                        <SelectItem label="155" value="155" />
                        <SelectItem label="1-684" value="-1684" />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                  <Input className="flex-1">
                    <InputField
                      placeholder="89867292632"
                      type="text"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="number-pad"
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      returnKeyType="done"
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
        <Heading className="font-roboto" size="sm">
          Address
        </Heading>
        <VStack space="md">
          <FormControl
            isInvalid={(!!errors.city || isEmailFocused) && !!errors.city}
          >
            <FormControlLabel className="mb-2">
              <FormControlLabelText>City</FormControlLabelText>
            </FormControlLabel>
            <Controller
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
                      <SelectItem label="Bengaluru" value="Bengaluru" />
                      <SelectItem label="Udupi" value="Udupi" />
                      <SelectItem label="Others" value="Others" />
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

          <FormControl
            isInvalid={(!!errors.state || isEmailFocused) && !!errors.state}
          >
            <FormControlLabel className="mb-2">
              <FormControlLabelText>State</FormControlLabelText>
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
                      <SelectItem label="Karnataka" value="Karnataka" />
                      <SelectItem label="Haryana" value="Haryana" />
                      <SelectItem label="Others" value="Others" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircle} size="md" />
              <FormControlErrorText>
                {errors?.state?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          <FormControl
            isInvalid={(!!errors.country || isEmailFocused) && !!errors.country}
          >
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
          <FormControl isInvalid={!!errors.zipcode || isEmailFocused}>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>Zipcode</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="zipcode"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await userCreateSchema.parseAsync({
                      zipCode: value,
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
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertCircle} size="md" />
              <FormControlErrorText>
                {errors?.zipcode?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        </VStack>
        <Button
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
