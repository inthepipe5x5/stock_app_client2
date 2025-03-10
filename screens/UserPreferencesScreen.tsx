import React, { useRef } from "react";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectInput, SelectPortal, SelectContent, SelectItem, SelectIcon } from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userPreferencesSchema } from "@/lib/schemas/userSchemas";
import defaultUserPreferences, { userPreferences } from "@/constants/userPreferences";
import { CheckCircle2 } from "lucide-react-native";
import { AlertCircleIcon } from "@/components/ui/icon";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { capitalizeSnakeCaseInputName } from "@/utils/capitalizeSnakeCaseInputName";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserSession } from "@/components/contexts/UserSessionProvider";

const UserPreferencesScreen = () => {

    const inputRefs = useRef<{ [key: string]: any }>({});
    const submitRef = useRef<any>(null);
    const { state, dispatch } = useUserSession();
    const existingUserPreferences = { ...defaultUserPreferences, ...state?.user?.preferences };

    const {
        control,
        formState: { errors, isDirty, isValid },
        handleSubmit,
        reset,
        watch,
    } = useForm<userPreferences>({
        resolver: zodResolver(userPreferencesSchema),
        defaultValues: existingUserPreferences,
    });

    const handleFocus = (name: string) => {
        inputRefs.current[name]?.scrollIntoView({ behavior: "smooth" });
        inputRefs.current[name]?.focus();
    };

    const handleKeyPress = (name: string) => {
        const inputNames = Object.keys(watch());
        if (!!(errors as any)[name]) {
            handleFocus(inputNames[inputNames.indexOf(name)]);
        }
        if (inputNames.indexOf(name) === inputNames.length - 1) {
            submitRef.current?.focus();
        }
        handleFocus(inputNames[inputNames.indexOf(name) + 1]);
    };

    const onSubmit = async (data: userPreferences) => {
        console.log("User Preferences:", data);
        // Handle form submission logic here
    };

    const createInputProps = (inputName: string, returnKeyType: string = "next") => {
        return {
            inputName,
            refs: inputRefs.current[inputName],
            control,
            schema: userPreferencesSchema,
            errors,
            isDirty,
            isValid,
            handleFocus,
            handleKeyPress,
            defaultValue: defaultUserPreferences[inputName as keyof userPreferences] ?? "",
            returnKeyType: returnKeyType ?? "next",
        };
    };

    const createControlledInput = ({ inputName, refs, control, schema, errors, isDirty, isValid, handleFocus, handleKeyPress, defaultValue, returnKeyType, }: any) => {
        return (
            <FormControl isInvalid={!!errors[inputName]} ref={refs}>
                <FormControlLabel className="text-sm mb-2">
                    <FormControlLabelText>
                        {capitalizeSnakeCaseInputName(inputName)}
                    </FormControlLabelText>
                </FormControlLabel>
                <Controller
                    name={inputName}
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
                                {isValid ?? <CheckCircle2 />}
                                <InputField
                                    placeholder={inputName}
                                    defaultValue={defaultValue[inputName] ?? ""}
                                    type="text"
                                    value={value}
                                    onFocus={() => handleFocus(inputName)}
                                    onChangeText={onChange}
                                    onSubmitEditing={() => handleKeyPress(inputName)}
                                    returnKeyType={returnKeyType ?? "next"}
                                />
                            </HStack>
                        </Input>
                    )}
                />
                <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} size="md" />
                    <FormControlErrorText>
                        {errors?.[inputName]?.message}
                    </FormControlErrorText>
                </FormControlError>
            </FormControl>
        );
    };

    return (
        <VStack className="md:hidden mb-5">
            <VStack space="lg" className="mx-4 mt-4">
                <Heading className="font-roboto" size="sm">
                    User Preferences
                </Heading>
                <VStack space="md">
                    <Heading className="font-roboto" size="md">
                        Appearance
                    </Heading>
                    <VStack space="md">
                        {createControlledInput(createInputProps("theme"))}
                        {createControlledInput(createInputProps("fontSize"))}
                        {createControlledInput(createInputProps("fontFamily"))}
                        {createControlledInput(createInputProps("boldText"))}
                        {createControlledInput(createInputProps("highContrast"))}
                    </VStack>

                    <Heading className="font-roboto" size="md">
                        Accessibility
                    </Heading>
                    <VStack space="md">
                        {createControlledInput(createInputProps("reduceMotion"))}
                        {createControlledInput(createInputProps("screenReaderEnabled"))}
                        {createControlledInput(createInputProps("textToSpeechRate"))}
                        {createControlledInput(createInputProps("zoomLevel"))}
                        {createControlledInput(createInputProps("colorBlindMode"))}
                    </VStack>

                    <Heading className="font-roboto" size="md">
                        Notifications
                    </Heading>
                    <VStack space="md">
                        {createControlledInput(createInputProps("notificationsEnabled"))}
                        {createControlledInput(createInputProps("soundEffects"))}
                        {createControlledInput(createInputProps("hapticFeedback"))}
                    </VStack>

                    <Heading className="font-roboto" size="md">
                        Privacy
                    </Heading>
                    <VStack space="md">
                        {createControlledInput(createInputProps("rememberMe"))}
                        {createControlledInput(createInputProps("cameraPermissions"))}
                        {createControlledInput(createInputProps("microphonePermissions"))}
                        {createControlledInput(createInputProps("locationPermissions"))}
                    </VStack>

                    <Heading className="font-roboto" size="md">
                        General
                    </Heading>
                    <VStack space="md">
                        {createControlledInput(createInputProps("language"))}
                        {createControlledInput(createInputProps("autoPlayVideos"))}
                        {createControlledInput(createInputProps("dataUsage"))}
                    </VStack>
                </VStack>

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
                        <ButtonText>Save Preferences</ButtonText>
                        <ButtonIcon as={CheckCircle2} />
                    </HStack>
                </Button>
            </VStack>
        </VStack>
    );
};

export default UserPreferencesScreen;