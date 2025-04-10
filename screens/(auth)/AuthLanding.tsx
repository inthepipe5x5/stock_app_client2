import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, TextInput, useColorScheme, Keyboard, StyleSheet } from "react-native";
import { useForm, Controller, set } from "react-hook-form";
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
  FormControlHelper,
  FormControlHelperText,
} from "@/components/ui/form-control";
import { ThemedView } from "@/components/ThemedView";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { HStack } from "@/components/ui/hstack";
import { Link, LinkText } from "@/components/ui/link";
import { AlertTriangle, ArrowRight, ChevronLeft, HomeIcon, HouseIcon, LockIcon } from "lucide-react-native";
import { RelativePathString, router, Stack, usePathname } from "expo-router";
import { AuthLayout } from "@/screens/(auth)/layout";
import { SignUpSchemaType, emailOnlySignUp } from "@/lib/schemas/authSchemas";
import { fetchProfile, getProfile, getUserProfileByEmail } from "@/lib/supabase/session";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import LoadingOverlay from "@/components/navigation/TransitionOverlayModal";
import { HelloWave } from "@/components/HelloWave";
import { Divider } from "@/components/ui/divider";
import { Image } from "@/components/ui/image";
import defaultSession, { userProfile } from "@/constants/defaultSession";
import Colors from '@/constants/Colors';
import { StatusBar } from "expo-status-bar";
import SubmitButton from "@/components/navigation/SubmitButton";
import Footer from "@/components/navigation/Footer";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/components/contexts/authContext";
import TransitionOverlayModal from "@/components/navigation/TransitionOverlayModal";


export default function AuthLanding() {
  const toast = useToast();
  const globalContext = useUserSession();
  const { state } = globalContext || defaultSession;
  const { dispatch } = globalContext;
  // const { state, dispatch, signOut } = useUserSession();
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const authContext = useAuth();
  const { form, handleFormChange } = authContext
  const { formState: { errors, isValid, ...useFormState }, reset, getValues, control, handleSubmit, watch } = form;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    const existingUser = async (email: string) => {
      return await getProfile({ email })
    }
    const emailInput = watch("email", "");
    if (useFormState.isDirty && isValid) {
      // handleFormChange({ email: emailInput });


    }
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    }

  }, []);



  const colors = Colors[useColorScheme() ?? 'light'];
  const oppositeColors = Colors[useColorScheme() === 'dark' ? 'light' : 'dark'];


  // A ref for focusing the submit button after we confirm no user is found
  const submitButtonRef = useRef<typeof Button>(null);

  /**
   * If the user is found => direct them to sign in.
   */
  const handleExistingUser = (existingUserData: any) => {
    const newUser = existingUserData.draft_status === "confirmed" ? true : false;
    const redirectPath = newUser ? "/(auth)/(signup)/new-user-signin" : "/(auth)/(signin)/authenticate";
    if (newUser) return handleContinueSignUp(existingUserData.email);
    dispatch({
      type: "SET_ANON_SESSION",
      payload: {
        ...defaultSession,
        user: {
          draft_status: "confirmed",
          ...existingUserData,
          password: "",
        },
      },
    });
    // show toast with "User found" and a button to sign in
    toast.show({
      placement: "top",
      render: ({ id }) => (
        <Toast nativeID={id} variant="solid" action="info">
          <HStack space="md">
            <AlertTriangle size={24} />
            <ToastTitle>User found. Please sign in.</ToastTitle>
            <Button
              onPress={() => router.push({
                pathname: '/', params: {
                  redirectPath,
                  nextURL: redirectPath,
                  dismissToURL: redirectPath
                },
              })}
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
      setLoading(true);
      router.push({
        pathname: '/',
        params: {
          redirectPath,
          nextURL: redirectPath,
          dismissToURL: redirectPath
        }
      });
    }, 5000 * 2);
  };

  /**
   * If user not found => store email in session => redirect to next route (create-password).
   */
  const handleContinueSignUp = (userData: Partial<userProfile>) => {

    console.log("email received => continuing sign up", userData);
    dispatch({
      type: "SET_ANON_SESSION",
      payload: {
        ...userData,
        draft_status: "draft"
      },
    });

    console.log("updated state post submit=", state);

    setLoading(false);
    //navigate to next route in the auth flow
    setTimeout(() => {
      router.push({ pathname: "/(auth)/(signup)/create-password" as any, });
    }, 1500);
  };

  // async function onSubmit(formData: any) {
  //   // The user pressed "Continue Sign Up" after possibly checking for existing user
  //   setLoading(true);

  //   try {
  //     //clear any existing session data if a new session is started and use the email provided
  //     dispatch({
  //       type: "SET_ANON_SESSION",
  //       payload: {
  //         ...defaultSession,
  //         user: {
  //           ...state?.user,
  //           email: formData.email ?? getValues("email"),
  //           draft_status: "draft",
  //         },
  //       },
  //     })
  //     // "final" check for existing user if not done already:
  //     const result = await getUserProfileByEmail(formData.email ?? getValues("email"));

  //     if (result?.error !== null) { console.error(result?.error); throw result?.error; }

  //     else if (result?.existingUser) {
  //       // If user found => redirect to sign in
  //       const newUser = result?.existingUser?.draft_status === "confirmed" ? true : false;
  //       newUser ? handleContinueSignUp({ email: formData.email }) : handleExistingUser({ ...result?.existingUser, email: formData.email });

  //     } else {
  //       // otherwise => continue sign up flow
  //       handleContinueSignUp({ email: formData.email });
  //     }
  //   } catch (err: any) {
  //     console.error("Error checking user or continuing signup:", err);
  //     toast.show({
  //       placement: "top",
  //       render: ({ id }) => (
  //         <Toast nativeID={id} variant="solid" action="error">
  //           <ToastTitle>{err?.message ?? "Error checking user"}</ToastTitle>
  //         </Toast>
  //       ),
  //     });
  //     setLoading(false);
  //     reset();
  //   }
  // }

  const onSubmit = async (formData: any = getValues()) => {
    // The user pressed "Continue Sign Up" after possibly checking for existing user
    setLoading(true);
    console.log("email received => continuing sign up", formData);
    try {
      const email = formData.email ?? getValues("email");

      //update temp user state and navigate to next route
      authContext.handleFormChange(
        getValues(),
        "/(auth)/(signup)/create-password" as RelativePathString,
        {}
      );
      setLoading(false);
    } catch (err: any) {
      console.error("Error checking user or continuing signup:", err);
      toast.show({
        placement: "top",
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

  //show errors
  if (errors && Object.keys(errors).length > 0) {
    console.log("Form Errors found:", errors);
    for (const [key, value] of Object.entries(errors)) {
      console.log(`Error in ${key}: ${value}`);
      toast.show({
        placement: "top",
        duration: 10000,
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action="error">
            <ToastTitle>{value?.type !== null ? `Form Error Type: ${String(value?.type)}` : "Form Error"}</ToastTitle>
            {value?.message ? (<ToastDescription>{String(value?.message) ?? "Something went wrong"}</ToastDescription>) : null}
          </Toast>
        ),
      });

    }
  }

  return (
    <AuthLayout>
      {
        Platform.OS === "android" ? (
          <StatusBar style="light" />
        ) : (
          <StatusBar style="auto" />
        )
      }
      <ThemedView style={
        [styles.themedContainer,
        { backgroundColor: colors.background }
        ]
      }>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Sign In Or Sign Up",
            headerStyle: {
              backgroundColor: colors.primary.main,
            },
            headerLargeTitleShadowVisible: Platform.OS !== 'web',
            headerTintColor: oppositeColors.primary.main,
            // headerLeft: () => {
            //   return (
            //     <Button
            //       variant="link"
            //       action="primary"
            //       onPress={() => {
            //         router.canGoBack()
            //           ? router.back()
            //           : router.replace({
            //             pathname: '/+not-found',
            //             params: {
            //               nextURL: '/',
            //               message: "Something went wrong. Please try again.",
            //             },
            //           });
            //       }}
            //       className="flex-row items-center justify-start mr-auto"
            //     >
            //       <ChevronLeft color={colors.accent} />
            //       {/* <ButtonText style={{ color: oppositeColors.primary.main }} className="text-lg font-semibold">
            //       Back
            //     </ButtonText> */}
            //     </Button>
            //   );
            // },
            // headerRight: () => (
            //   <HouseIcon color={colors.accent} />
            // ),
            headerShadowVisible: true,
            animation: "slide_from_left",
            animationDuration: 1000,
            animationMatchesGesture: Platform.OS === 'ios',
            animationTypeForReplace: Platform.OS === 'web' ? "pop" : "push",
            freezeOnBlur: ['ios', 'android'].includes(Platform.OS.toLowerCase()),
            presentation: "card",
          }}
        />

        <VStack
          space="md"
          className="self-center"
        >
          <VStack
            className="w-full flex-grow flex-start items-center"
          >
            {loading ? (
              <LoadingOverlay
                visible
                title="Please wait"
                subtitle="Checking user or continuing signup..."
                dismissToURL="/(auth)"
              />
            ) : (
              <ThemedView
                style={{
                  alignItems: "center",
                  marginBottom: 0,
                  paddingBottom: 0,
                  display: keyboardVisible ? "none" : "flex",
                }}
              >
                <Image
                  className="rounded-full my-6 py-5 h-1/2 w-1/2 aspect-[263/240]"
                  source={require("@/assets/images/splash-icon.png")}
                  resizeMethod="auto"
                  alt="Auth Landing Image"
                />
                <HStack className="justify-center mt-4">
                  {/* if we're loading => show overlay */}
                  <Heading size="3xl" className="text-center">
                    Welcome!
                  </Heading>
                  <HelloWave />
                </HStack>
                <Divider className="my-2" />
                <Text
                  size="lg"
                  className="self-center text-md font-normal mb-2 text-typography-700"
                >
                  Let's start by entering your email address.
                </Text>
              </ThemedView>
            )
            }
          </VStack>

          <KeyboardAvoidingView
            className='flex-1'
          >
            {/* Email field */}
            <FormControl isInvalid={!!errors.email}>

              <FormControlLabel>
                <FormControlLabelText>Email</FormControlLabelText>
              </FormControlLabel>
              <FormControlHelper className="mb-2">
                <FormControlHelperText>
                  {"Please enter a valid email address to proceed."}
                </FormControlHelperText>
              </FormControlHelper>
              <Controller
                control={control}
                name="email"
                defaultValue={state?.user?.email ?? ""}
                rules={{
                  validate: async (value) => {
                    try {
                      await emailOnlySignUp.parseAsync({ email: value });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                  required: "Email is required",
                }}

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
                <FormControlErrorText className="text-error-300 text-lg font-semibold">
                  {errors.email?.message ?? errors.email?.type === "validate" ? "Invalid email address" : "Please enter a valid email address"}
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

          </KeyboardAvoidingView>
        </VStack>
      </ThemedView>

      <Footer
        static={true}
        contentChildren={
          <>
            {!!loading ? (
              // <ProgressBar />
              <TransitionOverlayModal
                visible={loading}
                title="Please wait..."
                subtitle="Checking user or continuing signup..."
              // dismissToURL="/(auth)"
              />
            ) : (
              <SubmitButton
                disabled={loading || !!errors}
                focusRef={submitButtonRef}
                onSubmit={handleSubmit(onSubmit)}
                btnText={!!errors ? 'Enter a valid email' : 'Continue'}
                cnStyles={{
                  btn: {
                    backgroundColor: !loading ? oppositeColors.primary.main : colors.primary.main,
                  },
                  text: loading
                    ? oppositeColors.primary.main
                    : !!errors
                      ? 'text-error-400'
                      : oppositeColors.primary.main,
                  icon: {
                    color: loading ? oppositeColors.primary.main : oppositeColors.primary.main,
                  },
                }}
              />
            )}
          </>
        }
      />



    </AuthLayout >
  );
}

const styles = StyleSheet.create({
  themedContainer: {
    overflow: 'scroll',
    justifyContent: 'center',
    height: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    borderRadius: 50,
    width: '100%',
    shadowColor: '#808080',
    shadowOffset: {
      width: 5,
      height: 50,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    flex: 1,
  }
})