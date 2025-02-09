import { useRef, useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform, TextInput } from "react-native";
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
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react-native";
import { router, Stack } from "expo-router";
import { AuthLayout } from "@/screens/(auth)/layout";
import {
  SignUpSchemaType,
  nameEmailOnlySignUp,
} from "@/lib/schemas/authSchemas";
import supabase from "@/lib/supabase/supabase";
import { existingUserCheck } from "@/lib/supabase/session";
import * as SecureStore from "expo-secure-store";
import * as AsyncStorage from "expo-async-storage";
import { session } from "@/constants/defaultSession";
import appName from "@/constants/appName";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import LoadingOverlay from "@/components/navigation/TransitionOverlayModal";
import { HelloWave } from "@/components/HelloWave";
import { HStack } from "@/components/ui/hstack";
import { Center } from "@/components/ui/center";
import { Link, LinkText } from "@/components/ui/link";
import { ArrowRight } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
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

  // Refs for controlling focus among inputs
  // const firstNameRef = useRef<TextInput>(null);
  // const lastNameRef = useRef<TextInput>(null);
  // const emailRef = useRef<TextInput>(null);
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(nameEmailOnlySignUp),
  });
  const toast = useToast();
  const { state, dispatch, handleSignOut } = useUserSession() as {
    state: session;
    dispatch: (action: { type: string; payload: any }) => void;
    handleSignOut: () => void;
  };

  const handleErrors = (error: any) => {
    //log error
    console.error("Error finding existing user", error);
    // Check for Zod schema validation errors
    if (
      error.name === "ZodError" &&
      ["object", "array"].includes(typeof error.errors)
    ) {
      const fieldErrors = error?.errors.reduce((acc: any, curr: any) => {
        acc[curr.path[0]] = curr.message;
        return acc;
      }, {});

      // Focus on the input with the validation error
      if (fieldErrors.firstName) {
        toast.show({
          placement: "bottom right",
          render: ({ id }: any) => (
            <Toast nativeID={id} variant="solid" action="error">
              <ToastTitle>Error: {fieldErrors.firstName}</ToastTitle>
            </Toast>
          ),
        });
        // Focus on first name input
        return;
      }

      if (fieldErrors.lastName) {
        toast.show({
          placement: "bottom right",
          render: ({ id }: any) => (
            <Toast nativeID={id} variant="solid" action="error">
              <ToastTitle>Error: {fieldErrors.lastName}</ToastTitle>
            </Toast>
          ),
        });
        // Focus on last name input
        lastNameRef.current?.focus();
        return;
      }

      if (fieldErrors.email) {
        toast.show({
          placement: "bottom right",
          render: ({ id }: any) => (
            <Toast nativeID={id} variant="solid" action="error">
              <ToastTitle>Error: {fieldErrors.email}</ToastTitle>
            </Toast>
          ),
        });
        // Focus on email input
        emailRef.current?.focus();
        return;
      }
    }
    //show error toast for validation errors
    toast.show({
      placement: "bottom right",
      render: ({ id }: any) => (
        <Toast nativeID={id} variant="solid" action="error">
          <ToastTitle>{"Error finding existing user"}</ToastTitle>
        </Toast>
      ),
    });
    //set loading to false
    setLoading(false);
  };

  const signOutUser = async () => {
    //handle if user is already signed in
    dispatch({ type: "LOGOUT", payload: null });
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync(`${appName}_session`);
    await AsyncStorage.removeItem(`${appName}_session`);
  };
  //sign out current session if active
  useEffect(() => {
    async () => {
      const { session, error } = await supabase.auth.getSession();
      if ((session && session?.user) || (state && state?.user)) {
        console.log("User has an active session:", session || state?.user);
        await signOutUser();
      } else {
        console.log("No active session found.");
      }
    };
    signOutUser();
  }, []);

  const { data, error, status } = useQuery({
    queryKey: ["existingUserCheck", state?.user?.email],
    queryFn: existingUserCheck,
    enabled: !!loading && !!state?.user?.email,
  });

  //handle error
  if (status === "error") {
    handleErrors(error);
  }

  if (status === "success") {
    const { existingUser, error } = data;
    if (error) {
      // If supabase returns an error that means no user found or other
      // But let's interpret the logic:
      throw error;
    } else if (existingUser && existingUser !== null) {
      // If user found => replace state.user in session => redirect to sign in
      dispatch({
        type: "SET_USER",
        payload: {
          user: { ...existingUser, password: null },
        },
      });
      data;
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="info">
            <HStack space="md">
              <AlertTriangle size="24" />
              <ToastTitle>User found. Please sign in.</ToastTitle>
              <Button
                onPress={() => {
                  router.push("/(auth)/(signin)/authenticate");
                }}
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
    }
    //handle new user to continue sign up
    //update the session context with the new user data
    dispatch({
      type: "SET_USER",
      payload: {
        // firstName: getValues("firstName"),
        // lastName: getValues("lastName"),
        email: getValues("email"),
      },
    });
    //show success toast
    toast.show({
      placement: "bottom right",
      render: ({ id }) => (
        <Toast nativeID={id} variant="solid" action="success">
          <ToastTitle>New user data saved!</ToastTitle>
        </Toast>
      ),
    });
    //navigate to next route in the auth flow
    setTimeout(() => {
      router.push("/(auth)/(signup)/create-password");
    }, 1500);
  }

  async function onSubmit(formData: SignUpSchemaType) {
    try {
      //set loading to true & dispatch to user session context to start query
      setLoading(true);
      dispatch({
        type: "SET_USER",
        payload: {
          // firstName: formData.firstName,
          // lastName: formData.lastName,
          email: formData.email,
        },
      });

      //     if (error) {
      //       // Supabase error
      //       console.error("Error finding existing user", error);
      //       toast.show({
      //         placement: "bottom right",
      //         render: ({ id }) => (
      //           <Toast nativeID={id} variant="solid" action="error">
      //             <ToastTitle>{"Error finding existing user"}</ToastTitle>
      //           </Toast>
      //         ),
      //       });
      //       return;
      //     }

      //     if (error) {
      //       // If supabase returns an error that means no user found or other
      //       // But let's interpret the logic:
      //       throw error;
      //     }
      //     if (data) {
      //       // user found => redirect to /auth/signin
      //       toast.show({
      //         placement: "bottom right",
      //         render: ({ id }) => (
      //           <Toast nativeID={id} variant="solid" action="info">
      //             <ToastTitle>User already exists. Please sign in.</ToastTitle>
      //           </Toast>
      //         ),
      //       });

      //       router.replace("/(auth)/signin" as any);
      //       // Update session context with new user data
      //     } else {
      //       // No user found with this name and email
      //       toast.show({
      //         placement: "bottom right",
      //         render: ({ id }) => (
      //           <Toast nativeID={id} variant="solid" action="success">
      //             <ToastTitle>New user data saved!</ToastTitle>
      //           </Toast>
      //         ),
      //       });
      //       // navigate to next route in the auth flow
      //       // e.g. router.push("/(auth)/(signup)/create-password" as any);
      //     }
    } catch (err) {
      console.error("Supabase query error:", err);
      //     toast.show({
      //       placement: "bottom right",
      //       render: ({ id }) => (
      //         <Toast nativeID={id} variant="solid" action="error">
      //           <ToastTitle>
      //             "No user found with this name and email. Please sign up"
      //           </ToastTitle>
      //         </Toast>
      //       ),
      //     });
      //     // redirect to signup after 2 seconds
      //     setTimeout(() => {
      //       router.replace("/(auth)/(signup)/create-password" as any);
      //     }, 2000);
    }
  }

  return (
    <AuthLayout>
      {/* AuthLayout will wrap this, so we only render the form & overlay portion */}
      {status === "pending" && loading && (
        <LoadingOverlay
          visible={loading}
          title="Please wait"
          subtitle="Checking for existing users..."
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

          {/* <FormControl isInvalid={!!errors.firstName}>
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
          </FormControl> */}

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
                    returnKeyType="next"
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

          <Button className="w-full mt-4" onPress={handleSubmit(onSubmit)}>
            <ButtonText>Continue Sign Up</ButtonText>
            <ButtonIcon as={ArrowRight} />
          </Button>
        </VStack>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}
