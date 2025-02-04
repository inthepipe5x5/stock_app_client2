import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, TextInput, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react-native";
import { router, Stack } from "expo-router";
import { AuthLayout } from "@/screens/(auth)/layout";
import {
  SignUpSchemaType,
  nameEmailOnlySignUp,
} from "@/lib/schemas/authSchemas";
import supabase from "@/lib/supabase/supabase";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import LoadingOverlay from "@/components/navigation/TransitionOverlayModal";

export default function /* `AuthLanding` is a React functional component that represents a form for
collecting basic user information such as first name, last name, and email
for signing up. It uses various UI components like `Input`, `Button`,
`Toast`, and `LoadingOverlay` for user interaction. The component also
utilizes `react-hook-form` for form validation and submission handling. When
the form is submitted, it interacts with a Supabase database to check if a
user with the provided information already exists. Depending on the result,
it displays appropriate toast messages and may redirect the user to
different authentication routes. The component also handles keyboard
avoidance for better user experience when the keyboard is open. */
AuthLanding() {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(nameEmailOnlySignUp),
  });
  const toast = useToast();
  const { dispatch } = useUserSession() as { dispatch: (action: { type: string; payload: any }) => void };

  // Refs for controlling focus among inputs
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  async function onSubmit(formData: SignUpSchemaType) {
    try {
      //set loading to true
      setLoading(true);
      // dispatch to user session context
      dispatch({
        type: "SET_USER",
        payload: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        },
      });

      // Query Supabase for user with same email, name
      const { data, error } = await supabase
        .from("public.profiles")
        .select("*")
        .eq("email", formData.email)
        .eq("firstName", formData.firstName)
        .eq("lastName", formData.lastName)
        .single();

      if (error) {
        // If supabase returns an error that means no user found or other
        // But let's interpret the logic:
        throw error;
      }
      if (data) {
        // user found => redirect to /auth/signin
        toast.show({
          placement: "bottom right",
          render: ({ id }) => (
            <Toast nativeID={id} variant="solid" action="info">
              <ToastTitle>User already exists. Please sign in.</ToastTitle>
            </Toast>
          ),
        });

        router.replace("/(auth)/signin" as any);
        // Update session context with new user data
      } else {
        // No user found with this name and email
        toast.show({
          placement: "bottom right",
          render: ({ id }) => (
            <Toast nativeID={id} variant="solid" action="success">
              <ToastTitle>New user data saved!</ToastTitle>
            </Toast>
          ),
        });
        // navigate to next route in the auth flow
        // e.g. router.push("/(auth)/(signup)/create-password" as any);
      }
    } catch (err) {
      console.error("Supabase query error:", err);
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="error">
            <ToastTitle>
              "No user found with this name and email. Please sign up"
            </ToastTitle>
          </Toast>
        ),
      });
      // redirect to signup after 2 seconds
      setTimeout(() => {
        router.replace("/(auth)/(signup)/create-password" as any);
      }, 2000);
    }
  }

  return (
    <AuthLayout>
      {/* AuthLayout will wrap this, so we only render the form & overlay portion */}
      {loading && (
        <LoadingOverlay
          visible={loading}
          title="Please wait"
          subtitle="Checking for user with this name and email"
          dismissToURL="/(auth)"
        />
      )}
      <Stack.Screen options={{ headerShown: false }} />
      {/* Keyboard avoiding so input fields remain visible when keyboard is open */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <VStack space="md" className="max-w-[440px] w-full self-center mt-6">
          <Heading size="3xl" className="text-center">
            Basic Info
          </Heading>
          <FormControl isInvalid={!!errors.firstName}>
            <FormControlLabel>
              <FormControlLabelText>First Name</FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={control}
              name="firstName"
              defaultValue=""
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="Enter your first name"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    returnKeyType="next"
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertTriangle} />
              <FormControlErrorText>
                {errors.firstName?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          <FormControl isInvalid={!!errors.lastName}>
            <FormControlLabel>
              <FormControlLabelText>Last Name</FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={control}
              name="lastName"
              defaultValue=""
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    // ref={lastNameRef}
                    placeholder="Enter your last name"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertTriangle} />
              <FormControlErrorText>
                {errors.lastName?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          <FormControl isInvalid={!!errors.email}>
            <FormControlLabel>
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={control}
              name="email"
              defaultValue=""
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    // ref={emailRef}
                    placeholder="Enter your email"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertTriangle} />
              <FormControlErrorText>
                {errors.email?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          <Button className="w-full mt-4" onPress={handleSubmit(onSubmit)}>
            <ButtonText>Continue</ButtonText>
          </Button>
        </VStack>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}
