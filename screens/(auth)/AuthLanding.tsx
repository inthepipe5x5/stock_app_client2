import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
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
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { HStack } from "@/components/ui/hstack";
import { Center } from "@/components/ui/center";
import { Link, LinkText } from "@/components/ui/link";
import { AlertTriangle, ArrowRight } from "lucide-react-native";
import { router, Stack } from "expo-router";
import { AuthLayout } from "@/screens/(auth)/layout";
import { SignUpSchemaType, emailOnlySignUp } from "@/lib/schemas/authSchemas";
import { getUserProfileByEmail } from "@/lib/supabase/session";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import LoadingOverlay from "@/components/navigation/TransitionOverlayModal";
import { HelloWave } from "@/components/HelloWave";
import { Divider } from "@/components/ui/divider";
import defaultSession from "@/constants/defaultSession";

export default function AuthLanding() {
  const toast = useToast();
  const { state, dispatch, signOut } = useUserSession();
  const [loading, setLoading] = useState(false);

  // Setup react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(emailOnlySignUp),
    delayError: 2000,
    resetOptions: { keepDefaultValues: true, keepIsValid: true },
  });

  // A ref for focusing the submit button after we confirm no user is found
  const submitButtonRef = useRef<typeof Button>(null);

  /**
   * If the user is found => direct them to sign in.
   */
  const handleExistingUser = (existingUserData: any) => {
    dispatch({
      type: "SET_ANON_SESSION",
      payload: {
        ...defaultSession,
        user: {
          ...existingUserData,
          password: null,
        },
      },
    });
    // show toast with "User found" and a button to sign in
    toast.show({
      placement: "bottom right",
      render: ({ id }) => (
        <Toast nativeID={id} variant="solid" action="info">
          <HStack space="md">
            <AlertTriangle size={24} />
            <ToastTitle>User found. Please sign in.</ToastTitle>
            <Button
              onPress={() => router.push("/(auth)/(signin)/authenticate")}
              variant="outline"
              action="primary"
              size="sm"
              className="ml-5"
            >
              <ButtonText>Sign In</ButtonText>
            </Button>
          </HStack>
        </Toast>
      ),
    });
    setLoading(false);
    //redirect to sign in after 10 seconds
    setTimeout(() => {
      router.push("/(auth)/(signin)/authenticate");
    }, 5000 * 2);
  };

  /**
   * If user not found => store email in session => redirect to next route (create-password).
   */
  const handleContinueSignUp = (email: string) => {
    dispatch({
      type: "SET_USER",
      payload: {
        email,
      },
    });

    console.log("updated state post submit=", state);

    // toast.show({
    //   placement: "bottom right",
    //   render: ({ id }) => (
    //     <Toast nativeID={id} variant="solid" action="success">
    //       <ToastTitle>New user data saved!</ToastTitle>
    //     </Toast>
    //   ),
    // });
    setLoading(false);
    //navigate to next route in the auth flow
    setTimeout(() => {
      router.push("/(auth)/(signup)/create-password");
    }, 1500);
  };

  async function onSubmit(formData: SignUpSchemaType) {
    // The user pressed "Continue Sign Up" after possibly checking for existing user
    setLoading(true);
    try {
      // "final" check for existing user if not done already:
      const result = await getUserProfileByEmail(getValues("email"));
      console.log("email submit pressed", result);

      if (result?.error) throw result?.error;
      if (result?.existingUser) {
        // If user found => redirect to sign in
        handleExistingUser(result?.existingUser);
      } else {
        // otherwise => continue sign up flow
        handleContinueSignUp(formData.email);
      }
    } catch (err: any) {
      console.error("Error checking user or continuing signup:", err);
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="error">
            <ToastTitle>{err?.message ?? "Error checking user"}</ToastTitle>
          </Toast>
        ),
      });
      setLoading(false);
      reset();
    }
  }

  /**
   * Called when user finishes typing email and presses "enter".
   * Check if user exists, then either handleExistingUser or focus submit button.
   */
  async function onEmailSubmitEditing(emailValue: string) {
    setLoading(true);
    console.log("AuthLanding submit pressed => checking user:", emailValue);
    try {
      const result = await getUserProfileByEmail(emailValue);
      console.log("Result from getUserProfileByEmail:", result);
      if (result?.error) throw result?.error;
      if (result?.existingUser) {
        // Found user => handle it by redirecting them to sign in
        handleExistingUser(result?.existingUser);
      } else {
        // No user => focus on the submit button
        toast.show({
          placement: "bottom right",
          render: ({ id }) => (
            <Toast nativeID={id} variant="solid" action="info">
              <ToastTitle>
                No user found. Please click "Continue Sign Up".
              </ToastTitle>
            </Toast>
          ),
        });
        setInterval(() => {
          console.log("No existing user found, redirecting to signup");
          router.push("/(auth)/(signup)/create-password" as any); // or some way to highlight the button
        }, 5000);
        // submitButtonRef.current?.focus?.(); // or some way to highlight the button
      }
    } catch (err: any) {
      console.error("Error checking existing user:", err);
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="error">
            <ToastTitle>{err.message ?? "Error"}</ToastTitle>
          </Toast>
        ),
      });
      reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      {/* if we're loading => show overlay */}
      {loading && (
        <LoadingOverlay
          visible
          title="Please wait"
          subtitle="Checking user or continuing signup..."
          dismissToURL="/(auth)"
        />
      )}
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <VStack space="md" className="max-w-[440px] w-full self-center mt-6">
          <Center>
            <HStack className="justify-center">
              <Heading size="3xl" className="text-center">
                Welcome!
              </Heading>
              <HelloWave />
            </HStack>
            <Text
              size="lg"
              className="self-center text-md font-normal mb-2 text-typography-700"
            >
              Let's start by entering your user information.
            </Text>
          </Center>

          {/* Email field */}
          <FormControl isInvalid={!!errors.email}>
            <FormControlLabel>
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={control}
              name="email"
              defaultValue={state?.user?.email ?? ""}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    returnKeyType="next"
                    onSubmitEditing={async () => onSubmit({ email: value })}
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

          <Link href="/(auth)/(signin)" className="w-full">
            <HStack className="items-center">
              <LinkText
                size="sm"
                className="font-semibold text-info-600 no-underline"
              >
                Already have an account? Sign in here
              </LinkText>
            </HStack>
          </Link>

          <Button
            ref={submitButtonRef as any} // typed as any since we can't fully type Button ref
            className="w-full mt-4"
            onPress={handleSubmit(onSubmit)}
          >
            <ButtonText>Continue</ButtonText>
            <ButtonIcon as={ArrowRight} />
          </Button>
        </VStack>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}
