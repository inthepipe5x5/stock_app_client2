import React, { } from "react";
import { View } from "react-native";
import { useFormContext } from "react-hook-form";
import isTruthy from "@/utils/isTruthy";
import { HStack } from "../ui/hstack";
import { SaveIcon } from "lucide-react-native";
import { useUserSession } from "../contexts/UserSessionProvider";
import { convertCamelToSnake, convertObjectKeys } from "@/utils/caseConverter";
import supabase from "@/lib/supabase/supabase";
import { userCreateSchema, userSchemaDetails } from "@/lib/schemas/userSchemas";
import { baseInputProps } from "./GenericTextInput";
import GenericCheckbox from "./GenericCheckBox";
import { VStack } from "@/components/ui/vstack";

import { NestedLocationForm } from "@/components/forms/NestedLocationForm";
import defaultUserPreferences from "@/constants/userPreferences";
import { CreatePasswordSchemaType } from "@/lib/schemas/authSchemas";
import { pick } from "@/utils/pick";
import { GenericTextInput } from "@/components/forms/GenericTextInput";
import { MultiStepFormController } from "@/components/forms/MultiStepFormController";

export const profileSignUpForm = () => {
    const formContext = useFormContext();
    const { state: { user }, dispatch } = useUserSession();

    const onFinalSubmit = async () => {
        const { getValues, reset } = formContext;
        const mapping = convertObjectKeys(getValues(), convertCamelToSnake);
        //make form data sql upsert friendly
        const upsertData = {
            user_id: user?.user_id ?? new Crypto().getRandomValues(new Uint32Array(1))[0],
            email: user?.email ?? "",
            ...mapping,
        };

        //upsert data via supabase api 
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
        } else if (updatedProfile.data) {
            console.log("Profile edit successful");
            dispatch({ type: "UPDATE_USER", payload: updatedProfile.data });
        }
    };

    const emptyFormValues: Partial<userSchemaDetails> & { password?: string; confirmPassword?: string } | Partial<CreatePasswordSchemaType> = {
        email: "",
        phoneNumber: "",
        firstName: "",
        lastName: "",
        name: "",
        password: "",
        confirmPassword: "",
        city: "",
        state: "",
        country: "",
        postalcode: "",
        draftStatus: "draft",
        created_at: new Date().toISOString(),
        preferences: {
            ...defaultUserPreferences,
            theme: defaultUserPreferences.theme,
        },
        app_metadata: {
            is_super_admin: false,
            sso_user: false,
            provider: ""
        },
    };

    const snakeCaseUser = isTruthy(user) ? convertObjectKeys(user ?? {}, convertCamelToSnake) : {};
    const defaultValues: any = isTruthy(snakeCaseUser) ? { ...snakeCaseUser, preferences: { ...defaultUserPreferences, theme: user?.preferences?.theme }, ...emptyFormValues } : emptyFormValues;

    return (
        <MultiStepFormController
            zodSchema={userCreateSchema}
            initialFormData={defaultValues}
            titleProps={[
                { titleText: "Step 1: Authentication Method" },
                { titleText: "Step 2: Personal Information" },
                { titleText: "Step 3: Location" },
                { titleText: "Step 4: Settings" },
                { titleText: "Step 5: Confirm" },
            ]}
            onFinalSubmit={onFinalSubmit}
        >
            {/*
      ----------------------------------------
      Step 1: Authentication Method
      ----------------------------------------
      */}
            <VStack space="sm">
                <HStack space="md" className="w-full justify-evenly">
                    <View className="min-w-[200px] max-w-3">
                        <GenericTextInput
                            {...baseInputProps({
                                inputName: "password",
                                placeholder: "password",
                                textType: "password",
                                schema: userCreateSchema,
                                required: true,
                                defaultValues: defaultValues["password"] ?? "",
                            })}
                        />
                    </View>

                    <View className="min-w-[200px]">
                        <GenericTextInput
                            {...baseInputProps({
                                inputName: "lastName",
                                placeholder: "Last Name",
                                textType: "password",
                                schema: userCreateSchema,
                                required: true,
                                defaultValues: defaultValues["lastName"] ?? "",
                            })}
                        />
                    </View>
                </HStack>
                {/*
              SSO Auth options
              */}
                {/* <Divider className="min-w-[200px] max-w-3" />
                <GoogleSigninButtonComponent /> */}

            </VStack>
            {/* 
      {/*
      ----------------------------------------
      Step 2: Personal Information
      ----------------------------------------
      */}
            <VStack space="sm">
                <HStack space="md" className="w-full justify-evenly">
                    <View className="min-w-[200px] max-w-3">
                        <GenericTextInput
                            {...baseInputProps({
                                inputName: "firstName",
                                placeholder: "First Name",
                                schema: userCreateSchema,
                                required: true,
                                defaultValues: defaultValues["firstName"] ?? "",
                            })}
                        />
                    </View>

                    <View className="min-w-[200px]">
                        <GenericTextInput
                            {...baseInputProps({
                                inputName: "lastName",
                                placeholder: "Last Name",
                                schema: userCreateSchema,
                                required: true,
                                defaultValues: defaultValues["lastName"] ?? "",
                            })}
                        />
                    </View>
                </HStack>

                <View className="min-w-[200px]">
                    <GenericTextInput
                        {...baseInputProps({
                            inputName: "phoneNumber",
                            placeholder: "Phone Number",
                            schema: userCreateSchema,
                            required: true,
                            defaultValues: defaultValues["phoneNumber"] ?? "",
                        })}
                    />
                </View>
            </VStack>

            {/* 
      ----------------------------------------
      Step 2: Location 
      ----------------------------------------
      */}
            <NestedLocationForm defaultValues={{ ...pick(defaultValues, ["city", "postalcode", "state", "country"]) }} />

            <VStack space="md">
                <GenericCheckbox name="rememberMe" defaultValue={false} label="Remember me?" icon={SaveIcon} />
            </VStack>
        </MultiStepFormController>
    );
};
