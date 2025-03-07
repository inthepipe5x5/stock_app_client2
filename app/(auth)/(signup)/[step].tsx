import { StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from 'expo-router'
import isTruthy from '@/utils/isTruthy';
import { ArrowLeft, ArrowRight, SaveIcon, SaveOffIcon } from 'lucide-react-native';
import { ZodObject } from 'zod';
import { userCreateSchema, userSchemaDetails } from '@/lib/schemas/userSchemas';
import defaultUserPreferences from '@/constants/userPreferences';
import { CreatePasswordSchemaType } from '@/lib/schemas/authSchemas';
import { AuthLayout } from '@/screens/(auth)/_layout';
import Auth from '..';

const SignUpStepScreen = ({ children, ...props }: any) => {
    const params = useLocalSearchParams();
    const title = props.titleProps ?? params.title ?? "Sign Up";
    const step = params.step ?? 1;
    const [displayAlert, setDisplayAlert] = useState(params.displayAlert ?? false);
    const router = useRouter();
    const schema = userCreateSchema;

    const emptyFormValues: Partial<userSchemaDetails> & { password?: string; confirmPassword?: string } | Partial<CreatePasswordSchemaType> = {
        //user details
        email: "",
        phoneNumber: "",
        firstName: "",
        lastName: "",
        name: "",
        // password: "",
        // confirmPassword: "",
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


    const stepScreenURLChain = (step: number, returnArray: boolean = false) => {
        // const emptyStepProps = {
        //     title: "" as string,
        //     description: "" as string | null | undefined,
        //     // zodSchema: ZodObject<any>,
        //     // children: [] as React.ReactNode[] | null | undefined,
        //     onFinalSubmit: (values: any) => { },
        //     prevButtonTitle: "Back" as string,
        //     prevButtonIcon: <ArrowLeft /> as React.ReactElement | null,
        //     nextButtonTitle: "" as string,
        //     nextButtonIcon: <ArrowRight /> as React.ReactElement | null,

        //     returnKeyType: "next" as "next" | "done",
        // }

        // switch (+step) {
        //     case 1:
        //         // emptyStepProps.title = "Set up your password or use a social account";
        //         // emptyStepProps.description = "Create a password to secure your account";
        //         // emptyStepProps.prevButtonIcon = <ArrowLeft />;
        //         emptyStepProps.title = "Enter Your Personal Information";
        //         emptyStepProps.description = "Enter your personal information to get started";

        //         return;
        //     case 2:
        //         return "location";
        //     case 3:
        //         return "location";
        //     case 4:
        //         return "location";

        //     case 5: //final step
        //         emptyStepProps.title = "Confirm your details";
        //         emptyStepProps.description = "Review your details before you finish";
        //         emptyStepProps.prevButtonTitle = "Back";
        //         emptyStepProps.prevButtonIcon = <SaveOffIcon />;
        //         emptyStepProps.nextButtonTitle = "Finish";
        //         emptyStepProps.nextButtonIcon = <SaveIcon />;
        //         emptyStepProps.returnKeyType = "done";

        //         return emptyStepProps;
        //     default:
        //         return emptyStepProps;
        // }
        const signUpURLs = [
            "(auth)/(signup)",
            /* Signup steps */
            "(auth)/(signup)/email",
            "(auth)/(signup)/authentication",
            // "(auth)/(signup)/login", //should i ask the user to login once the authentication method is set?
            "(auth)/(signup)/personal",
            "(auth)/(signup)/location",
            "(auth)/(signup)/settings",
            "(auth)/(signup)/household", //user can add a household or join an existing one
            "(auth)/(signup)/confirm",
        ]
        return returnArray ? signUpURLs : signUpURLs[step - 1];
    }

    return (
        <AuthLayout>
            <Stack.Screen name="[step]" options={{ title: title ?? `Sign Up ${step}` }} />
        </AuthLayout>
    )
}


export default SignUpStepScreen
